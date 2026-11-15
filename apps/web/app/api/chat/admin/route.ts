import { openai } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { z } from "zod";
import {
  Order, Product, InventoryItem, Customer,
  Brand, Category, RepairTicket,
  ilike, iequals, plain,
} from "@cellphonelt/db";
import { estimateDelivery } from "@/lib/delivery";
import { sendOrderStatusEmail } from "@/lib/email";

export const maxDuration = 60;

/** Map customerId -> customer (lean) for the given rows — replaces LEFT JOIN customers. */
async function customersById(customerIds: (string | null | undefined)[]) {
  const ids = [...new Set(customerIds.filter(Boolean))] as string[];
  const list = ids.length ? await Customer.find({ _id: { $in: ids } }).lean() : [];
  return new Map(list.map((c) => [c.id, c]));
}

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
          const orderDocs = await Order.find({ status: status ?? "pending" })
            .sort({ createdAt: -1 })
            .limit(limit ?? 15)
            .lean();
          const custMap = await customersById(orderDocs.map((o) => o.customerId));
          const rows = orderDocs.map((o) => {
            const c = custMap.get(o.customerId);
            return {
              ...o,
              customerName: c?.fullName ?? null,
              customerEmail: c?.email ?? null,
              customerPhone: c?.phoneNumber ?? null,
            };
          });

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
          const orderDoc = await Order.findOne({ _id: orderId }).lean();
          const orderCustomer = orderDoc ? await Customer.findOne({ _id: orderDoc.customerId }).lean() : null;
          const orderRows = orderDoc
            ? [{
                id: orderDoc.id,
                status: orderDoc.status,
                shippingAddress: orderDoc.shippingAddress,
                customerName: orderCustomer?.fullName ?? null,
                customerEmail: orderCustomer?.email ?? null,
              }]
            : [];

          if (!orderRows.length) return { success: false, reason: `Không tìm thấy đơn hàng ${orderId}` };
          const order = orderRows[0];
          const oldStatus = order.status;

          await Order.updateOne({ _id: orderId }, { $set: { status: newStatus } });

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
              await Order.updateOne({ _id: id }, { $set: { status: newStatus } });
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
          const totalResult = await InventoryItem.aggregate([
            { $match: { stockStatus: "available" } },
            { $group: { _id: null, total: { $sum: "$quantity" } } },
          ]);

          // Sum available quantity per product, keep products below the threshold
          const lowStockRows = plain<any[]>(await InventoryItem.aggregate([
            { $match: { stockStatus: "available" } },
            { $group: { _id: "$productId", totalQty: { $sum: "$quantity" } } },
            { $match: { totalQty: { $lt: lowStockThreshold ?? 5 } } },
            { $lookup: { from: Product.collection.name, localField: "_id", foreignField: "_id", as: "product" } },
            {
              $project: {
                _id: 0,
                productId: "$_id",
                totalQty: 1,
                productName: { $ifNull: [{ $arrayElemAt: ["$product.name", 0] }, null] },
              },
            },
          ]));

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
          const prod = await Product.findOne({ _id: productId }).lean();
          if (!prod) return { success: false, reason: `Không tìm thấy sản phẩm ID: ${productId}` };

          const newItem = await InventoryItem.create({
            productId,
            quantity,
            costPrice: costPrice ?? null,
            conditionGrade: conditionGrade ?? "new",
            warehouseLocation: warehouseLocation ?? null,
            imeiSerial: imeiSerial ?? null,
            notes: notes ?? null,
            stockStatus: "available",
          });

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
              let product: { id: string } | null = row.productId
                ? await Product.findOne({ _id: row.productId }).lean()
                : await Product.findOne({ name: iequals(row.productName.trim()) }).lean();

              if (!product) {
                // Find or create category
                let catId: string | null = null;
                if (row.category) {
                  let cat: { id: string } | null = await Category.findOne({ name: iequals(row.category.trim()) }).lean();
                  if (!cat) {
                    const newCat = await Category.create({
                      name: row.category.trim(),
                      slug: row.category.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                    });
                    cat = { id: newCat.id };
                  }
                  catId = cat?.id ?? null;
                }

                // Create new product
                const slug = row.productName.trim().toLowerCase()
                  .replace(/[àáâãäå]/g, "a").replace(/[èéêë]/g, "e")
                  .replace(/[ìíîï]/g, "i").replace(/[òóôõö]/g, "o")
                  .replace(/[ùúûü]/g, "u").replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-|-$/g, "") + "-" + Date.now();

                const newProduct = await Product.create({
                  name: row.productName.trim(),
                  slug,
                  basePrice: row.price ? row.price : null,
                  categoryId: catId,
                  images: row.imageLink ? [row.imageLink] : [],
                  status: "active",
                  aiSpecs: row.description ? { description: row.description } : null,
                });
                product = { id: newProduct.id };
                created++;
              } else {
                // Update price if provided
                if (row.price) {
                  await Product.updateOne({ _id: product.id }, { $set: { basePrice: row.price } });
                }
                updated++;
              }

              // Add inventory stock
              if ((row.stockLevel ?? 0) > 0) {
                await InventoryItem.create({
                  productId: product.id,
                  quantity: row.stockLevel ?? 1,
                  costPrice: row.cost ? row.cost.toString() : null,
                  stockStatus: "available",
                  conditionGrade: "new",
                });
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
          const filter: Record<string, any> = {};
          if (keyword) filter.name = ilike(keyword);
          if (status) filter.status = status;

          // Products + brand/category names + sum of "available" inventory quantity
          const rows = plain<any[]>(await Product.aggregate([
            { $match: filter },
            { $sort: { createdAt: -1 } },
            { $limit: limit ?? 10 },
            { $lookup: { from: Brand.collection.name, localField: "brandId", foreignField: "_id", as: "brand" } },
            { $lookup: { from: Category.collection.name, localField: "categoryId", foreignField: "_id", as: "category" } },
            {
              $lookup: {
                from: InventoryItem.collection.name,
                let: { pid: "$_id" },
                pipeline: [
                  { $match: { $expr: { $and: [{ $eq: ["$productId", "$$pid"] }, { $eq: ["$stockStatus", "available"] }] } } },
                  { $group: { _id: null, total: { $sum: "$quantity" } } },
                ],
                as: "stockAgg",
              },
            },
            {
              $project: {
                name: 1,
                slug: 1,
                sku: 1,
                basePrice: 1,
                status: 1,
                brandName: { $ifNull: [{ $arrayElemAt: ["$brand.name", 0] }, null] },
                categoryName: { $ifNull: [{ $arrayElemAt: ["$category.name", 0] }, null] },
                stock: { $ifNull: [{ $arrayElemAt: ["$stockAgg.total", 0] }, 0] },
              },
            },
          ]));

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
          const prod = await Product.findOne({ _id: productId }).lean();
          if (!prod) return { success: false, reason: `Không tìm thấy sản phẩm ID: ${productId}` };

          const updates: Record<string, any> = {};
          if (status) updates.status = status;
          if (name) updates.name = name;
          if (basePrice !== undefined) updates.basePrice = basePrice;
          if (minPrice !== undefined) updates.minPrice = minPrice;
          if (maxPrice !== undefined) updates.maxPrice = maxPrice;

          // updatedAt is maintained by Mongoose timestamps
          await Product.updateOne({ _id: productId }, { $set: updates });

          return {
            success: true,
            productId,
            productName: name ?? prod.name,
            changes: { updatedAt: new Date(), ...updates },
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
            const cat = await Category.findOne({ name: ilike(categoryName) }).lean();
            catId = cat?.id ?? null;
          }
          if (brandName) {
            const br = await Brand.findOne({ name: ilike(brandName) }).lean();
            brandId = br?.id ?? null;
          }

          const slug = name.trim().toLowerCase()
            .replace(/[àáâãäå]/g, "a").replace(/[èéêë]/g, "e")
            .replace(/[ìíîï]/g, "i").replace(/[òóôõö]/g, "o")
            .replace(/[ùúûü]/g, "u").replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "") + "-" + Date.now();

          const newProduct = await Product.create({
            name: name.trim(),
            slug,
            basePrice: basePrice ? basePrice : null,
            categoryId: catId,
            brandId: brandId,
            status: status ?? "draft",
            aiSpecs: description ? { description } : null,
            images: [],
          });

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
          const ticketDocs = await RepairTicket.find(status ? { status } : {})
            .sort({ createdAt: -1 })
            .limit(limit ?? 10)
            .lean();
          const custMap = await customersById(ticketDocs.map((t) => t.customerId));
          const rows = ticketDocs.map((t) => {
            const c = custMap.get(t.customerId);
            return {
              ...t,
              customerName: c?.fullName ?? null,
              customerPhone: c?.phoneNumber ?? null,
              customerEmail: c?.email ?? null,
            };
          });

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
          const ticket = await RepairTicket.findOne({ _id: ticketId }).lean();
          if (!ticket) return { success: false, reason: `Không tìm thấy phiếu ${ticketId}` };

          const updates: Record<string, any> = {};
          if (status) updates.status = status;
          if (technicianNotes) updates.technicianNotes = technicianNotes;
          if (estimatedCost !== undefined) updates.estimatedCost = estimatedCost;
          if (finalCost !== undefined) {
            updates.finalCost = finalCost;
            if (status === "done") updates.completedAt = new Date();
          }

          await RepairTicket.updateOne({ _id: ticketId }, { $set: updates });

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
          const filter = query
            ? { $or: [
                { fullName: ilike(query) },
                { phoneNumber: ilike(query) },
                { email: ilike(query) },
              ] }
            : {};

          const customerDocs = await Customer.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit ?? 10)
            .lean();

          // Order count per customer (replaces LEFT JOIN orders + COUNT(DISTINCT orders.id))
          const counts = customerDocs.length
            ? await Order.aggregate([
                { $match: { customerId: { $in: customerDocs.map((c) => c.id) } } },
                { $group: { _id: "$customerId", orderCount: { $sum: 1 } } },
              ])
            : [];
          const countMap = new Map<string, number>(counts.map((r: any) => [r._id, r.orderCount]));
          const rows = customerDocs.map((c) => ({ ...c, orderCount: countMap.get(c.id) ?? 0 }));

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

          const [revenueRow] = await Order.aggregate([
            { $match: { createdAt: { $gte: startOfDay, $lte: endOfDay }, status: "delivered" } },
            { $group: { _id: null, revenue: { $sum: "$totalAmount" }, orderCount: { $sum: 1 } } },
          ]);

          const pendingRow = { count: await Order.countDocuments({ status: "pending" }) };

          const newOrderRow = {
            count: await Order.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } }),
          };

          const repairRow = {
            open: await RepairTicket.countDocuments({ status: { $nin: ["done", "delivered", "cancelled"] } }),
            done: await RepairTicket.countDocuments({ status: "done" }),
          };

          // Total available quantity + number of distinct products that have an
          // available inventory item with quantity <= 5 (per item, as before)
          const [stockAgg] = await InventoryItem.aggregate([
            { $match: { stockStatus: "available" } },
            {
              $group: {
                _id: null,
                total: { $sum: "$quantity" },
                lowIds: { $addToSet: { $cond: [{ $lte: ["$quantity", 5] }, "$productId", null] } },
              },
            },
          ]);
          const stockRow = {
            total: stockAgg?.total ?? 0,
            lowCount: (stockAgg?.lowIds ?? []).filter((x: any) => x != null).length,
          };

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
