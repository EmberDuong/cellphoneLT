import { openai } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { z } from "zod";
import {
  db, orders, products, inventoryItems, customers,
  orderItems, brands, categories, repairTickets,
  desc, eq, sql, ilike, and, or, gte, lte,
} from "@cellphonelt/db";
import { estimateDelivery } from "@/lib/delivery";
import { sendOrderStatusEmail } from "@/lib/email";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o"),
    onError: (error) => { console.error("[admin-chat]", error); },
    system: `Bạn là AI Copilot toàn quyền của CellphoneLT Admin Panel — trợ lý quản trị thông minh nhất, có đầy đủ quyền thực thi mọi tác vụ quản trị.

## Quyền hạn đầy đủ của bạn:
1. **Quản lý đơn hàng**: xem, cập nhật hàng loạt, ước tính giao hàng, gửi email khách hàng
2. **Quản lý sản phẩm**: xem, tạo mới, cập nhật trạng thái/giá, tìm kiếm
3. **Quản lý kho hàng**: xem tồn kho, thêm lô hàng mới, nhập từ Excel
4. **Phiếu sửa chữa**: xem danh sách, cập nhật trạng thái và ghi chú kỹ thuật viên
5. **Khách hàng**: tìm kiếm, xem lịch sử mua hàng
6. **Báo cáo**: tạo báo cáo tổng hợp theo ngày (doanh thu, đơn hàng, kho)

## Phong cách làm việc:
- **Chủ động hành động**: khi admin yêu cầu, hãy THỰC HIỆN ngay (không chỉ tư vấn)
- **Báo cáo rõ ràng**: sau mỗi hành động, tóm tắt kết quả bằng bullet points
- **Đề xuất tiếp theo**: sau mỗi tác vụ, đề xuất bước tiếp theo hợp lý
- **Cảnh báo chủ động**: nếu thấy vấn đề (hàng sắp hết, đơn tồn lâu), hãy báo ngay
- Dùng tiếng Việt. Ngắn gọn, chuyên nghiệp.`,
    messages,
    maxSteps: 10,
    tools: {

      // ─── 1. FETCH ORDERS ──────────────────────────────────────────────
      fetchOrders: tool({
        description: "Lấy danh sách đơn hàng theo trạng thái, bao gồm thông tin khách hàng và địa chỉ giao hàng.",
        parameters: z.object({
          status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]).optional().default("pending"),
          limit: z.number().optional().default(15),
        }),
        execute: async ({ limit, status }) => {
          const rows = await db.select({
            id: orders.id,
            status: orders.status,
            totalAmount: orders.totalAmount,
            paymentMethod: orders.paymentMethod,
            paymentStatus: orders.paymentStatus,
            shippingAddress: orders.shippingAddress,
            createdAt: orders.createdAt,
            customerName: customers.fullName,
            customerEmail: customers.email,
            customerPhone: customers.phoneNumber,
          })
            .from(orders)
            .leftJoin(customers, eq(orders.customerId, customers.id))
            .where(eq(orders.status, status ?? "pending"))
            .orderBy(desc(orders.createdAt))
            .limit(limit ?? 15);

          return rows.map((o) => ({
            id: o.id,
            shortId: o.id.slice(0, 8).toUpperCase(),
            status: o.status,
            customerName: o.customerName ?? "N/A",
            customerEmail: o.customerEmail,
            customerPhone: o.customerPhone,
            totalAmount: Number(o.totalAmount),
            paymentMethod: o.paymentMethod,
            paymentStatus: o.paymentStatus,
            city: (o.shippingAddress as any)?.city ?? "N/A",
            address: (o.shippingAddress as any)?.address ?? "N/A",
            date: o.createdAt,
          }));
        },
      }),

      // ─── 2. UPDATE ORDER STATUS ───────────────────────────────────────
      updateOrderStatus: tool({
        description: "Cập nhật trạng thái đơn hàng và tự động gửi email thông báo đến khách hàng.",
        parameters: z.object({
          orderId: z.string().describe("UUID của đơn hàng"),
          newStatus: z.enum(["processing", "shipped", "delivered", "cancelled"]),
          estimatedDeliveryDays: z.number().optional(),
        }),
        execute: async ({ orderId, newStatus, estimatedDeliveryDays }) => {
          const orderRows = await db.select({
            id: orders.id,
            status: orders.status,
            shippingAddress: orders.shippingAddress,
            customerName: customers.fullName,
            customerEmail: customers.email,
          })
            .from(orders)
            .leftJoin(customers, eq(orders.customerId, customers.id))
            .where(eq(orders.id, orderId));

          if (!orderRows.length) return { success: false, reason: `Không tìm thấy đơn hàng ${orderId}` };
          const order = orderRows[0];
          const oldStatus = order.status;

          await db.update(orders).set({ status: newStatus, updatedAt: new Date() } as any).where(eq(orders.id, orderId));

          if (order.customerEmail) {
            await sendOrderStatusEmail(order.customerEmail, {
              customerName: order.customerName ?? "Khách hàng",
              orderId,
              newStatus,
              estimatedDays: estimatedDeliveryDays,
            });
          }

          return { success: true, orderId, shortId: orderId.slice(0, 8).toUpperCase(), oldStatus, newStatus, emailSent: !!order.customerEmail };
        },
      }),

      // ─── 3. BULK UPDATE ORDERS ────────────────────────────────────────
      bulkUpdateOrders: tool({
        description: "Cập nhật hàng loạt nhiều đơn hàng sang trạng thái mới cùng lúc.",
        parameters: z.object({
          orderIds: z.array(z.string()).describe("Danh sách UUID đơn hàng"),
          newStatus: z.enum(["processing", "shipped", "delivered", "cancelled"]),
        }),
        execute: async ({ orderIds, newStatus }) => {
          let successCount = 0;
          const failed: string[] = [];
          for (const id of orderIds) {
            try {
              await db.update(orders).set({ status: newStatus, updatedAt: new Date() } as any).where(eq(orders.id, id));
              successCount++;
            } catch {
              failed.push(id.slice(0, 8).toUpperCase());
            }
          }
          return { successCount, failedCount: failed.length, failed, newStatus };
        },
      }),

      // ─── 4. ESTIMATE DELIVERY ─────────────────────────────────────────
      estimateDelivery: tool({
        description: "Ước tính thời gian giao hàng đến tỉnh/thành phố ở Việt Nam.",
        parameters: z.object({
          city: z.string(),
          orderId: z.string().optional(),
        }),
        execute: async ({ city, orderId }) => {
          const estimate = estimateDelivery(city);
          const today = new Date();
          const minDate = new Date(today); minDate.setDate(today.getDate() + estimate.minDays);
          const maxDate = new Date(today); maxDate.setDate(today.getDate() + estimate.maxDays);
          return {
            city: estimate.inputCity, region: estimate.region,
            minDays: estimate.minDays, maxDays: estimate.maxDays,
            estimatedArrivalMin: minDate.toLocaleDateString("vi-VN"),
            estimatedArrivalMax: maxDate.toLocaleDateString("vi-VN"),
            note: estimate.note, orderId: orderId ?? null,
          };
        },
      }),

      // ─── 5. GET INVENTORY SUMMARY ─────────────────────────────────────
      getInventorySummary: tool({
        description: "Tóm tắt kho hàng: tổng số, sắp hết hàng, phân tích theo sản phẩm.",
        parameters: z.object({ lowStockThreshold: z.number().optional().default(5) }),
        execute: async ({ lowStockThreshold }) => {
          const totalResult = await db.select({
            total: sql<number>`COALESCE(SUM(${inventoryItems.quantity}), 0)`,
          }).from(inventoryItems).where(eq(inventoryItems.stockStatus, "available"));

          const lowStockRows = await db.select({
            productName: products.name,
            totalQty: sql<number>`SUM(${inventoryItems.quantity})`,
            productId: inventoryItems.productId,
          })
            .from(inventoryItems)
            .leftJoin(products, eq(inventoryItems.productId, products.id))
            .where(eq(inventoryItems.stockStatus, "available"))
            .groupBy(inventoryItems.productId, products.name)
            .having(sql`SUM(${inventoryItems.quantity}) < ${lowStockThreshold ?? 5}`);

          return {
            totalInventoryItems: Number(totalResult[0]?.total ?? 0),
            lowStockAlerts: lowStockRows.map((r) => ({
              productName: r.productName,
              quantity: Number(r.totalQty),
              productId: r.productId,
            })),
          };
        },
      }),

      // ─── 6. ADD INVENTORY ITEM ────────────────────────────────────────
      addInventoryItem: tool({
        description: "Thêm một lô hàng mới vào kho cho một sản phẩm.",
        parameters: z.object({
          productId: z.string(),
          quantity: z.number().default(1),
          costPrice: z.string().optional(),
          conditionGrade: z.enum(["new", "grade_a", "grade_b", "grade_c"]).optional().default("new"),
          warehouseLocation: z.string().optional(),
          imeiSerial: z.string().optional(),
          notes: z.string().optional(),
        }),
        execute: async ({ productId, quantity, costPrice, conditionGrade, warehouseLocation, imeiSerial, notes }) => {
          // Verify product exists
          const prod = await db.query.products.findFirst({ where: eq(products.id, productId) });
          if (!prod) return { success: false, reason: `Không tìm thấy sản phẩm ID: ${productId}` };

          const [newItem] = await db.insert(inventoryItems).values({
            productId,
            quantity,
            costPrice: costPrice ?? null,
            conditionGrade: conditionGrade ?? "new",
            warehouseLocation: warehouseLocation ?? null,
            imeiSerial: imeiSerial ?? null,
            notes: notes ?? null,
            stockStatus: "available",
          } as any).returning();

          return { success: true, itemId: newItem.id, productName: prod.name, quantity, message: `Đã thêm ${quantity} sản phẩm "${prod.name}" vào kho.` };
        },
      }),

      // ─── 7. IMPORT INVENTORY FROM EXCEL DATA ─────────────────────────
      importInventoryFromExcel: tool({
        description: "Nhập kho hàng loạt từ dữ liệu Excel đã được parse. Mỗi row sẽ tạo hoặc cập nhật sản phẩm và thêm inventory.",
        parameters: z.object({
          rows: z.array(z.object({
            productId:    z.string().optional(),
            productName:  z.string(),
            category:     z.string().optional(),
            description:  z.string().optional(),
            price:        z.number().optional(),
            cost:         z.number().optional(),
            stockLevel:   z.number().optional(),
            reorderPoint: z.number().optional(),
            imageLink:    z.string().optional(),
          })),
        }),
        execute: async ({ rows }) => {
          let created = 0, updated = 0, skipped = 0;
          const errors: string[] = [];

          for (const row of rows) {
            try {
              if (!row.productName?.trim()) { skipped++; continue; }

              // Try to find existing product by ID or name
              let product = row.productId
                ? await db.query.products.findFirst({ where: eq(products.id, row.productId) })
                : await db.query.products.findFirst({ where: ilike(products.name, row.productName.trim()) });

              if (!product) {
                // Find or create category
                let catId: string | null = null;
                if (row.category) {
                  let cat = await db.query.categories.findFirst({ where: ilike(categories.name, row.category.trim()) });
                  if (!cat) {
                    const [newCat] = await db.insert(categories).values({
                      name: row.category.trim(),
                      slug: row.category.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                    } as any).returning();
                    cat = newCat;
                  }
                  catId = cat?.id ?? null;
                }

                // Create new product
                const slug = row.productName.trim().toLowerCase()
                  .replace(/[àáâãäå]/g, "a").replace(/[èéêë]/g, "e")
                  .replace(/[ìíîï]/g, "i").replace(/[òóôõö]/g, "o")
                  .replace(/[ùúûü]/g, "u").replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-|-$/g, "") + "-" + Date.now();

                const [newProduct] = await db.insert(products).values({
                  name: row.productName.trim(),
                  slug,
                  basePrice: row.price ? row.price.toString() : null,
                  categoryId: catId,
                  images: row.imageLink ? [row.imageLink] : [],
                  status: "active",
                  aiSpecs: row.description ? { description: row.description } : null,
                } as any).returning();
                product = newProduct;
                created++;
              } else {
                // Update price if provided
                if (row.price) {
                  await db.update(products).set({ basePrice: row.price.toString(), updatedAt: new Date() } as any).where(eq(products.id, product.id));
                }
                updated++;
              }

              // Add inventory stock
              if ((row.stockLevel ?? 0) > 0) {
                await db.insert(inventoryItems).values({
                  productId: product.id,
                  quantity: row.stockLevel ?? 1,
                  costPrice: row.cost ? row.cost.toString() : null,
                  stockStatus: "available",
                  conditionGrade: "new",
                } as any);
              }
            } catch (err: any) {
              errors.push(`"${row.productName}": ${err?.message ?? "Lỗi không xác định"}`);
              skipped++;
            }
          }

          return {
            success: true,
            totalRows: rows.length,
            created,
            updated,
            skipped,
            errors: errors.slice(0, 5),
            message: `Nhập Excel hoàn tất: ${created} sản phẩm mới, ${updated} cập nhật, ${skipped} bỏ qua.`,
          };
        },
      }),

      // ─── 8. SEARCH / LIST PRODUCTS ────────────────────────────────────
      searchProducts: tool({
        description: "Tìm kiếm sản phẩm trong catalog theo từ khóa, danh mục, thương hiệu hoặc trạng thái.",
        parameters: z.object({
          keyword: z.string().optional(),
          status: z.enum(["draft", "active", "archived"]).optional(),
          limit: z.number().optional().default(10),
        }),
        execute: async ({ keyword, status, limit }) => {
          const conditions: any[] = [];
          if (keyword) conditions.push(ilike(products.name, `%${keyword}%`));
          if (status) conditions.push(eq(products.status, status));

          const rows = await db.select({
            id: products.id,
            name: products.name,
            slug: products.slug,
            sku: products.sku,
            basePrice: products.basePrice,
            status: products.status,
            brandName: brands.name,
            categoryName: categories.name,
            stock: sql<number>`COALESCE(SUM(CASE WHEN ${inventoryItems.stockStatus} = 'available' THEN ${inventoryItems.quantity} ELSE 0 END), 0)`,
          })
            .from(products)
            .leftJoin(brands, eq(products.brandId, brands.id))
            .leftJoin(categories, eq(products.categoryId, categories.id))
            .leftJoin(inventoryItems, eq(inventoryItems.productId, products.id))
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .groupBy(products.id, brands.name, categories.name)
            .orderBy(desc(products.createdAt))
            .limit(limit ?? 10);

          return rows.map((p) => ({
            id: p.id,
            name: p.name,
            sku: p.sku,
            price: Number(p.basePrice ?? 0),
            status: p.status,
            brand: p.brandName,
            category: p.categoryName,
            stock: Number(p.stock),
          }));
        },
      }),

      // ─── 9. UPDATE PRODUCT STATUS / INFO ─────────────────────────────
      updateProductStatus: tool({
        description: "Cập nhật trạng thái sản phẩm (draft/active/archived) hoặc thay đổi tên, giá.",
        parameters: z.object({
          productId: z.string(),
          status: z.enum(["draft", "active", "archived"]).optional(),
          name: z.string().optional(),
          basePrice: z.number().optional(),
          minPrice: z.number().optional(),
          maxPrice: z.number().optional(),
        }),
        execute: async ({ productId, status, name, basePrice, minPrice, maxPrice }) => {
          const prod = await db.query.products.findFirst({ where: eq(products.id, productId) });
          if (!prod) return { success: false, reason: `Không tìm thấy sản phẩm ID: ${productId}` };

          const updates: Record<string, any> = { updatedAt: new Date() };
          if (status) updates.status = status;
          if (name) updates.name = name;
          if (basePrice !== undefined) updates.basePrice = basePrice.toString();
          if (minPrice !== undefined) updates.minPrice = minPrice.toString();
          if (maxPrice !== undefined) updates.maxPrice = maxPrice.toString();

          await db.update(products).set(updates as any).where(eq(products.id, productId));

          return {
            success: true,
            productId,
            productName: name ?? prod.name,
            changes: updates,
            message: `Đã cập nhật sản phẩm "${name ?? prod.name}" thành công.`,
          };
        },
      }),

      // ─── 10. CREATE PRODUCT ───────────────────────────────────────────
      createProduct: tool({
        description: "Tạo sản phẩm mới trong catalog.",
        parameters: z.object({
          name: z.string(),
          basePrice: z.number().optional(),
          categoryName: z.string().optional(),
          brandName: z.string().optional(),
          description: z.string().optional(),
          status: z.enum(["draft", "active"]).optional().default("draft"),
        }),
        execute: async ({ name, basePrice, categoryName, brandName, description, status }) => {
          let catId: string | null = null;
          let brandId: string | null = null;

          if (categoryName) {
            const cat = await db.query.categories.findFirst({ where: ilike(categories.name, `%${categoryName}%`) });
            catId = cat?.id ?? null;
          }
          if (brandName) {
            const br = await db.query.brands.findFirst({ where: ilike(brands.name, `%${brandName}%`) });
            brandId = br?.id ?? null;
          }

          const slug = name.trim().toLowerCase()
            .replace(/[àáâãäå]/g, "a").replace(/[èéêë]/g, "e")
            .replace(/[ìíîï]/g, "i").replace(/[òóôõö]/g, "o")
            .replace(/[ùúûü]/g, "u").replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "") + "-" + Date.now();

          const [newProduct] = await db.insert(products).values({
            name: name.trim(),
            slug,
            basePrice: basePrice ? basePrice.toString() : null,
            categoryId: catId,
            brandId: brandId,
            status: status ?? "draft",
            aiSpecs: description ? { description } : null,
            images: [],
          } as any).returning();

          return { success: true, productId: newProduct.id, name: newProduct.name, status: newProduct.status, slug: newProduct.slug };
        },
      }),

      // ─── 11. GET REPAIR TICKETS ───────────────────────────────────────
      getRepairTickets: tool({
        description: "Lấy danh sách phiếu sửa chữa đang mở theo trạng thái.",
        parameters: z.object({
          status: z.enum(["intake", "diagnosing", "awaiting_parts", "in_progress", "quality_check", "done", "delivered", "cancelled"]).optional(),
          limit: z.number().optional().default(10),
        }),
        execute: async ({ status, limit }) => {
          const rows = await db.select({
            id: repairTickets.id,
            status: repairTickets.status,
            priority: repairTickets.priority,
            deviceBrand: repairTickets.deviceBrand,
            deviceModel: repairTickets.deviceModel,
            reportedIssue: repairTickets.reportedIssue,
            estimatedCost: repairTickets.estimatedCost,
            technicianNotes: repairTickets.technicianNotes,
            createdAt: repairTickets.createdAt,
            customerName: customers.fullName,
            customerPhone: customers.phoneNumber,
            customerEmail: customers.email,
          })
            .from(repairTickets)
            .leftJoin(customers, eq(repairTickets.customerId, customers.id))
            .where(status ? eq(repairTickets.status, status) : undefined)
            .orderBy(desc(repairTickets.createdAt))
            .limit(limit ?? 10);

          return rows.map((t) => ({
            id: t.id,
            shortId: t.id.slice(0, 8).toUpperCase(),
            status: t.status,
            priority: t.priority,
            device: `${t.deviceBrand} ${t.deviceModel}`,
            issue: t.reportedIssue,
            estimatedCost: Number(t.estimatedCost ?? 0),
            notes: t.technicianNotes,
            customerName: t.customerName ?? "N/A",
            customerPhone: t.customerPhone ?? "N/A",
            date: t.createdAt,
          }));
        },
      }),

      // ─── 12. UPDATE REPAIR TICKET ─────────────────────────────────────
      updateRepairTicket: tool({
        description: "Cập nhật trạng thái, ghi chú kỹ thuật viên hoặc chi phí sửa chữa cho phiếu.",
        parameters: z.object({
          ticketId: z.string(),
          status: z.enum(["intake", "diagnosing", "awaiting_parts", "in_progress", "quality_check", "done", "delivered", "cancelled"]).optional(),
          technicianNotes: z.string().optional(),
          estimatedCost: z.number().optional(),
          finalCost: z.number().optional(),
        }),
        execute: async ({ ticketId, status, technicianNotes, estimatedCost, finalCost }) => {
          const ticket = await db.query.repairTickets.findFirst({ where: eq(repairTickets.id, ticketId) });
          if (!ticket) return { success: false, reason: `Không tìm thấy phiếu ${ticketId}` };

          const updates: Record<string, any> = { updatedAt: new Date() };
          if (status) updates.status = status;
          if (technicianNotes) updates.technicianNotes = technicianNotes;
          if (estimatedCost !== undefined) updates.estimatedCost = estimatedCost.toString();
          if (finalCost !== undefined) {
            updates.finalCost = finalCost.toString();
            if (status === "done") updates.completedAt = new Date();
          }

          await db.update(repairTickets).set(updates as any).where(eq(repairTickets.id, ticketId));

          return { success: true, ticketId, shortId: ticketId.slice(0, 8).toUpperCase(), changes: Object.keys(updates).filter(k => k !== "updatedAt"), message: `Đã cập nhật phiếu sửa chữa #${ticketId.slice(0, 8).toUpperCase()}.` };
        },
      }),

      // ─── 13. GET CUSTOMERS ────────────────────────────────────────────
      getCustomers: tool({
        description: "Tìm kiếm khách hàng theo tên, số điện thoại hoặc email. Xem lịch sử mua hàng.",
        parameters: z.object({
          query: z.string().optional().describe("Từ khóa tìm kiếm: tên, SĐT, hoặc email"),
          limit: z.number().optional().default(10),
        }),
        execute: async ({ query, limit }) => {
          const conditions = query ? or(
            ilike(customers.fullName, `%${query}%`),
            ilike(customers.phoneNumber, `%${query}%`),
            ilike(customers.email, `%${query}%`),
          ) : undefined;

          const rows = await db.select({
            id: customers.id,
            fullName: customers.fullName,
            email: customers.email,
            phoneNumber: customers.phoneNumber,
            loyaltyPoints: customers.loyaltyPoints,
            totalLifetimeSpend: customers.totalLifetimeSpend,
            createdAt: customers.createdAt,
            orderCount: sql<number>`COUNT(DISTINCT ${orders.id})`,
          })
            .from(customers)
            .leftJoin(orders, eq(orders.customerId, customers.id))
            .where(conditions)
            .groupBy(customers.id)
            .orderBy(desc(customers.createdAt))
            .limit(limit ?? 10);

          return rows.map((c) => ({
            id: c.id,
            fullName: c.fullName,
            email: c.email,
            phone: c.phoneNumber,
            loyaltyPoints: c.loyaltyPoints ?? 0,
            totalSpend: Number(c.totalLifetimeSpend ?? 0),
            orderCount: Number(c.orderCount),
            memberSince: c.createdAt,
          }));
        },
      }),

      // ─── 14. DAILY REPORT ─────────────────────────────────────────────
      getDailyReport: tool({
        description: "Tạo báo cáo tổng hợp theo ngày: doanh thu, đơn hàng, phiếu sửa chữa, cảnh báo kho.",
        parameters: z.object({
          date: z.string().optional().describe("Ngày báo cáo (YYYY-MM-DD), mặc định là hôm nay"),
        }),
        execute: async ({ date }) => {
          const targetDate = date ? new Date(date) : new Date();
          const startOfDay = new Date(targetDate); startOfDay.setHours(0, 0, 0, 0);
          const endOfDay   = new Date(targetDate); endOfDay.setHours(23, 59, 59, 999);

          const [revenueRow] = await db.select({
            revenue: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
            orderCount: sql<number>`COUNT(*)`,
          }).from(orders)
            .where(and(
              gte(orders.createdAt, startOfDay),
              lte(orders.createdAt, endOfDay),
              eq(orders.status, "delivered"),
            ));

          const [pendingRow] = await db.select({
            count: sql<number>`COUNT(*)`,
          }).from(orders).where(eq(orders.status, "pending"));

          const [newOrderRow] = await db.select({
            count: sql<number>`COUNT(*)`,
          }).from(orders).where(and(
            gte(orders.createdAt, startOfDay),
            lte(orders.createdAt, endOfDay),
          ));

          const [repairRow] = await db.select({
            open: sql<number>`COUNT(CASE WHEN ${repairTickets.status} NOT IN ('done', 'delivered', 'cancelled') THEN 1 END)`,
            done: sql<number>`COUNT(CASE WHEN ${repairTickets.status} = 'done' THEN 1 END)`,
          }).from(repairTickets);

          const [stockRow] = await db.select({
            total: sql<number>`COALESCE(SUM(${inventoryItems.quantity}), 0)`,
            lowCount: sql<number>`COUNT(DISTINCT CASE WHEN ${inventoryItems.quantity} <= 5 THEN ${inventoryItems.productId} END)`,
          }).from(inventoryItems).where(eq(inventoryItems.stockStatus, "available"));

          return {
            date: targetDate.toLocaleDateString("vi-VN"),
            revenue: Number(revenueRow?.revenue ?? 0),
            newOrders: Number(newOrderRow?.count ?? 0),
            pendingOrders: Number(pendingRow?.count ?? 0),
            deliveredRevenue: Number(revenueRow?.revenue ?? 0),
            repairOpen: Number(repairRow?.open ?? 0),
            repairDoneToday: Number(repairRow?.done ?? 0),
            totalStock: Number(stockRow?.total ?? 0),
            lowStockProducts: Number(stockRow?.lowCount ?? 0),
          };
        },
      }),

      // ─── 15. SCHEDULE TASK / REMINDER ────────────────────────────────
      scheduleTask: tool({
        description: "Ghi lại một ghi chú, kế hoạch hoặc nhắc nhở cho admin. Dùng để lên lịch và tổ chức công việc.",
        parameters: z.object({
          title: z.string().describe("Tên công việc/nhắc nhở"),
          description: z.string().optional(),
          priority: z.enum(["low", "medium", "high", "urgent"]).optional().default("medium"),
          dueTime: z.string().optional().describe("Thời hạn (ví dụ: '17:00 hôm nay', '2024-12-01')"),
        }),
        execute: async ({ title, description, priority, dueTime }) => {
          // In a real system this would persist to a DB table
          // For now we return a formatted task card the UI can display
          return {
            success: true,
            task: { title, description, priority, dueTime, createdAt: new Date().toISOString() },
            message: `✅ Đã ghi nhận công việc: "${title}"${dueTime ? ` — Hạn: ${dueTime}` : ""}. Ưu tiên: ${priority}.`,
          };
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
