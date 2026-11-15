"use server";

import { Customer, Order, RepairTicket, TradeInAppraisal, ChatSession } from "@cellphonelt/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const customerSchema = z.object({
  fullName: z.string().min(2, "Tên quá ngắn"),
  phoneNumber: z.string().optional().nullable(),
  email: z.string().email("Email không hợp lệ").optional().nullable().or(z.literal("")),
  zaloOaId: z.string().optional().nullable(),
  loyaltyPoints: z.coerce.number().min(0).default(0),
});

export async function createCustomerAction(prevState: any, formData: FormData) {
  try {
    const data = {
      fullName: formData.get("fullName") as string,
      phoneNumber: formData.get("phoneNumber") as string || null,
      email: formData.get("email") as string || null,
      zaloOaId: formData.get("zaloOaId") as string || null,
      loyaltyPoints: formData.get("loyaltyPoints") || 0,
    };

    const parsed = customerSchema.safeParse(data);

    if (!parsed.success) {
      return {
        error: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
        details: parsed.error.flatten().fieldErrors,
      };
    }

    await Customer.create(parsed.data as any);

  } catch (error: any) {
    console.error("Create Customer Error:", error);
    // Có thể lỗi do trùng phone/email unique
    if (error.code === 11000) {
        return { error: "Số điện thoại hoặc Email đã được sử dụng." };
    }
    return { error: error.message || "Đã xảy ra lỗi khi thêm khách hàng" };
  }

  revalidatePath("/admin/customers");
  redirect("/admin/customers");
}

export async function updateCustomerAction(id: string, prevState: any, formData: FormData) {
  try {
    const data = {
      fullName: formData.get("fullName") as string,
      phoneNumber: formData.get("phoneNumber") as string || null,
      email: formData.get("email") as string || null,
      zaloOaId: formData.get("zaloOaId") as string || null,
      loyaltyPoints: formData.get("loyaltyPoints") || 0,
    };

    const parsed = customerSchema.safeParse(data);

    if (!parsed.success) {
      return {
        error: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
        details: parsed.error.flatten().fieldErrors,
      };
    }

    await Customer.updateOne({ _id: id }, { $set: parsed.data as any });

  } catch (error: any) {
    console.error("Update Customer Error:", error);
    if (error.code === 11000) {
        return { error: "Số điện thoại hoặc Email đã được sử dụng." };
    }
    return { error: error.message || "Đã xảy ra lỗi khi cập nhật khách hàng" };
  }

  revalidatePath("/admin/customers");
  redirect("/admin/customers");
}

export async function deleteCustomerAction(id: string) {
  try {
    // Postgres FKs from orders / repair_tickets / trade_in_appraisals refused the
    // delete when the customer had linked records; chat_sessions were set null.
    const [hasOrders, hasRepairs, hasTradeIns] = await Promise.all([
      Order.exists({ customerId: id }),
      RepairTicket.exists({ customerId: id }),
      TradeInAppraisal.exists({ customerId: id }),
    ]);
    if (hasOrders || hasRepairs || hasTradeIns) {
      throw new Error("Customer has linked orders / repair tickets / trade-ins");
    }
    await Customer.deleteOne({ _id: id });
    await ChatSession.updateMany({ customerId: id }, { $set: { customerId: null } });
    revalidatePath("/admin/customers");
    return { success: true };
  } catch (error: any) {
    console.error("Delete Customer Error:", error);
    // Nếu dính khóa ngoại (đã có order, repair) thì sẽ không xóa được
    return { error: "Không thể xóa khách hàng này. (Khách hàng có thể đang liên kết với đơn hàng/phiếu sửa chữa)" };
  }
}
