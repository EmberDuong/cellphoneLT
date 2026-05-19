"use server";

import { db, customers, eq } from "@cellphonelt/db";
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

    await db.insert(customers).values(parsed.data as any);

  } catch (error: any) {
    console.error("Create Customer Error:", error);
    // Có thể lỗi do trùng phone/email unique
    if (error.code === '23505') {
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

    await db.update(customers).set(parsed.data as any).where(eq(customers.id, id));

  } catch (error: any) {
    console.error("Update Customer Error:", error);
    if (error.code === '23505') {
        return { error: "Số điện thoại hoặc Email đã được sử dụng." };
    }
    return { error: error.message || "Đã xảy ra lỗi khi cập nhật khách hàng" };
  }

  revalidatePath("/admin/customers");
  redirect("/admin/customers");
}

export async function deleteCustomerAction(id: string) {
  try {
    await db.delete(customers).where(eq(customers.id, id));
    revalidatePath("/admin/customers");
    return { success: true };
  } catch (error: any) {
    console.error("Delete Customer Error:", error);
    // Nếu dính khóa ngoại (đã có order, repair) thì sẽ không xóa được
    return { error: "Không thể xóa khách hàng này. (Khách hàng có thể đang liên kết với đơn hàng/phiếu sửa chữa)" };
  }
}
