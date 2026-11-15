import { openai } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { z } from "zod";
import {
  Product, Category, Brand, Customer,
  Order, OrderItem, InventoryItem,
  ilike, plain,
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
          const filter: Record<string, any> = { status: "active" };
          if (keyword) filter.name = ilike(keyword);
          if (minPrice || maxPrice) {
            filter.basePrice = {};
            if (minPrice) filter.basePrice.$gte = minPrice;
            if (maxPrice) filter.basePrice.$lte = maxPrice;
          }

          if (categoryName) {
            const cat = await Category.findOne({ name: ilike(categoryName) }).lean();
            if (cat) filter.categoryId = cat.id;
          }
          if (brandName) {
            const br = await Brand.findOne({ name: ilike(brandName) }).lean();
            if (br) filter.brandId = br.id;
          }

          // Check stock per product (sum of quantity over "available" inventory items)
          const rows = plain<any[]>(await Product.aggregate([
            { $match: filter },
            { $limit: limit ?? 5 },
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
                as: "stock",
              },
            },
            {
              $project: {
                name: 1,
                basePrice: 1,
                slug: 1,
                brandName: { $ifNull: [{ $arrayElemAt: ["$brand.name", 0] }, null] },
                categoryName: { $ifNull: [{ $arrayElemAt: ["$category.name", 0] }, null] },
                availableStock: { $ifNull: [{ $arrayElemAt: ["$stock.total", 0] }, 0] },
              },
            },
          ]));

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
          const stockRows = await InventoryItem.aggregate([
            { $match: { productId, stockStatus: "available" } },
            { $group: { _id: null, totalAvailable: { $sum: "$quantity" } } },
          ]);

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
          let customer: { id: string } | null = await Customer.findOne({ email: customerEmail }).lean();

          if (!customer) {
            const newCustomer = await Customer.create({
              fullName: customerName,
              email: customerEmail,
              phoneNumber: customerPhone,
            });
            customer = { id: newCustomer.id };
          }

          // 3. Create order
          const newOrder = await Order.create({
            customerId: customer.id,
            totalAmount,
            shippingAddress: { fullName: customerName, phoneNumber: customerPhone, address, city, note },
            paymentMethod: paymentMethod as "cod" | "bank_transfer",
            paymentStatus: "pending",
            status: "pending",
          });

          // 4. Create order item
          await OrderItem.create({
            orderId: newOrder.id,
            productId,
            productName,
            unitPrice,
            quantity,
            subtotal: totalAmount,
          });

          // 5. Deduct from inventory (FIFO — deduct from first available batch)
          let remaining = quantity;
          const inventoryBatches = await InventoryItem.find({ productId, stockStatus: "available" })
            .sort({ createdAt: 1 })
            .lean();

          for (const batch of inventoryBatches) {
            if (remaining <= 0) break;
            if (batch.quantity <= remaining) {
              await InventoryItem.updateOne({ _id: batch.id }, { $set: { stockStatus: "sold", quantity: 0 } });
              remaining -= batch.quantity;
            } else {
              await InventoryItem.updateOne({ _id: batch.id }, { $set: { quantity: batch.quantity - remaining } });
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
