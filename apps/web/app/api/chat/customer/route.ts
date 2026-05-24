import { openai } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { z } from "zod";
import {
  db, products, categories, brands, customers,
  orders, orderItems, inventoryItems,
  ilike, and, gte, lte, eq, sql,
} from "@cellphonelt/db";
import { sendOrderConfirmationEmail } from "@/lib/email";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o"),
    onError: (error) => {
      console.error("[STREAM_ERROR]", error);
    },
    system: `Bạn là trợ lý bán hàng thân thiện và chuyên nghiệp của CellphoneLT — nền tảng thương mại điện tử hàng đầu về điện thoại, phụ kiện, sửa chữa và thu mua máy cũ tại Việt Nam.

Nhiệm vụ của bạn:
1. Dùng tool searchProducts để gợi ý sản phẩm phù hợp với nhu cầu khách hàng (danh mục, thương hiệu, giá).
2. Dùng tool placeOrder để đặt hàng khi khách hàng đồng ý. Yêu cầu đủ thông tin: tên, email, số điện thoại, địa chỉ, thành phố, phương thức thanh toán trước khi gọi tool.
3. Nếu sản phẩm hết hàng, TỰ ĐỘNG từ chối đơn hàng và đề xuất sản phẩm thay thế.
4. Trả lời ngắn gọn, lịch sự. Dùng tiếng Việt là chính.
5. KHÔNG đặt hàng nếu thiếu thông tin giao hàng.`,
    messages,
    maxSteps: 5,
    tools: {
      searchProducts: tool({
        description: "Tìm kiếm sản phẩm trong kho theo từ khóa, danh mục, thương hiệu, khoảng giá. Trả về danh sách sản phẩm phù hợp.",
        parameters: z.object({
          keyword: z.string().optional().describe("Từ khóa tên sản phẩm"),
          categoryName: z.string().optional().describe("Tên danh mục (ví dụ: 'Điện thoại', 'Phụ kiện')"),
          brandName: z.string().optional().describe("Tên thương hiệu (ví dụ: 'Apple', 'Samsung')"),
          minPrice: z.number().optional().describe("Giá tối thiểu (VND)"),
          maxPrice: z.number().optional().describe("Giá tối đa (VND)"),
          limit: z.number().optional().default(5).describe("Số lượng kết quả tối đa"),
        }),
        execute: async ({ keyword, categoryName, brandName, minPrice, maxPrice, limit }) => {
          const conditions: any[] = [eq(products.status, "active")];
          if (keyword) conditions.push(ilike(products.name, `%${keyword}%`));
          if (minPrice) conditions.push(gte(products.basePrice, minPrice.toString()));
          if (maxPrice) conditions.push(lte(products.basePrice, maxPrice.toString()));

          if (categoryName) {
            const cat = await db.query.categories.findFirst({ where: ilike(categories.name, `%${categoryName}%`) });
            if (cat) conditions.push(eq(products.categoryId, cat.id));
          }
          if (brandName) {
            const br = await db.query.brands.findFirst({ where: ilike(brands.name, `%${brandName}%`) });
            if (br) conditions.push(eq(products.brandId, br.id));
          }

          // Check stock per product
          const rows = await db.select({
            id: products.id,
            name: products.name,
            basePrice: products.basePrice,
            slug: products.slug,
            brandName: brands.name,
            categoryName: categories.name,
            availableStock: sql<number>`COALESCE(SUM(CASE WHEN ${inventoryItems.stockStatus} = 'available' THEN ${inventoryItems.quantity} ELSE 0 END), 0)`,
          })
            .from(products)
            .leftJoin(brands, eq(products.brandId, brands.id))
            .leftJoin(categories, eq(products.categoryId, categories.id))
            .leftJoin(inventoryItems, eq(inventoryItems.productId, products.id))
            .where(and(...conditions))
            .groupBy(products.id, brands.name, categories.name)
            .limit(limit ?? 5);

          return rows.map((p) => ({
            id: p.id,
            name: p.name,
            price: Number(p.basePrice),
            url: `/product/${p.slug}`,
            brand: p.brandName,
            category: p.categoryName,
            inStock: Number(p.availableStock) > 0,
            availableStock: Number(p.availableStock),
          }));
        },
      }),

      placeOrder: tool({
        description: "Đặt đơn hàng mới cho khách hàng. Kiểm tra tồn kho tự động — từ chối nếu hết hàng. Tạo đơn hàng trong DB và gửi email xác nhận.",
        parameters: z.object({
          productId: z.string().describe("ID sản phẩm (lấy từ kết quả searchProducts)"),
          productName: z.string().describe("Tên sản phẩm"),
          quantity: z.number().default(1).describe("Số lượng"),
          unitPrice: z.number().describe("Đơn giá (VND)"),
          customerName: z.string().describe("Họ tên khách hàng"),
          customerEmail: z.string().describe("Email khách hàng để nhận xác nhận"),
          customerPhone: z.string().describe("Số điện thoại"),
          address: z.string().describe("Địa chỉ giao hàng"),
          city: z.string().describe("Tỉnh/Thành phố"),
          paymentMethod: z.enum(["cod", "bank_transfer"]).default("cod").describe("Phương thức thanh toán"),
          note: z.string().optional().describe("Ghi chú cho đơn hàng"),
        }),
        execute: async ({ productId, productName, quantity, unitPrice, customerName, customerEmail, customerPhone, address, city, paymentMethod, note }) => {
          // 1. Check inventory availability
          const stockRows = await db.select({
            totalAvailable: sql<number>`COALESCE(SUM(${inventoryItems.quantity}), 0)`,
          })
            .from(inventoryItems)
            .where(and(
              eq(inventoryItems.productId, productId),
              eq(inventoryItems.stockStatus, "available"),
            ));

          const totalAvailable = Number(stockRows[0]?.totalAvailable ?? 0);

          if (totalAvailable < quantity) {
            return {
              success: false,
              reason: totalAvailable === 0
                ? `Sản phẩm "${productName}" hiện đã hết hàng. Vui lòng chọn sản phẩm khác.`
                : `Sản phẩm "${productName}" chỉ còn ${totalAvailable} chiếc, không đủ số lượng yêu cầu (${quantity}).`,
            };
          }

          const totalAmount = unitPrice * quantity;

          // 2. Find or create customer
          let customer = await db.query.customers.findFirst({
            where: eq(customers.email, customerEmail),
          });

          if (!customer) {
            const [newCustomer] = await db.insert(customers).values({
              fullName: customerName,
              email: customerEmail,
              phoneNumber: customerPhone,
            } as any).returning();
            customer = newCustomer;
          }

          // 3. Create order
          const [newOrder] = await db.insert(orders).values({
            customerId: customer.id,
            totalAmount: totalAmount.toString(),
            shippingAddress: { fullName: customerName, phoneNumber: customerPhone, address, city, note },
            paymentMethod: paymentMethod as "cod" | "bank_transfer",
            paymentStatus: "pending",
            status: "pending",
          } as any).returning();

          // 4. Create order item
          await db.insert(orderItems).values({
            orderId: newOrder.id,
            productId,
            productName,
            unitPrice: unitPrice.toString(),
            quantity,
            subtotal: totalAmount.toString(),
          } as any);

          // 5. Deduct from inventory (FIFO — deduct from first available batch)
          let remaining = quantity;
          const inventoryBatches = await db.select()
            .from(inventoryItems)
            .where(and(eq(inventoryItems.productId, productId), eq(inventoryItems.stockStatus, "available")))
            .orderBy(inventoryItems.createdAt);

          for (const batch of inventoryBatches) {
            if (remaining <= 0) break;
            if (batch.quantity <= remaining) {
              await db.update(inventoryItems)
                .set(({ stockStatus: "sold", quantity: 0, updatedAt: new Date() }) as any)
                .where(eq(inventoryItems.id, batch.id));
              remaining -= batch.quantity;
            } else {
              await db.update(inventoryItems)
                .set(({ quantity: batch.quantity - remaining, updatedAt: new Date() }) as any)
                .where(eq(inventoryItems.id, batch.id));
              remaining = 0;
            }
          }

          // 6. Send confirmation email
          await sendOrderConfirmationEmail(customerEmail, {
            customerName,
            orderId: newOrder.id,
            productName,
            quantity,
            totalAmount,
            address,
            city,
          });

          return {
            success: true,
            orderId: newOrder.id,
            productName,
            quantity,
            totalAmount,
            message: `Đơn hàng đã được tạo thành công! Email xác nhận đã gửi đến ${customerEmail}.`,
          };
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
