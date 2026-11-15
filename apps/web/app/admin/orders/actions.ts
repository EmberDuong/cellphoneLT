"use server";

import { Order } from "@cellphonelt/db";
import { revalidatePath } from "next/cache";

export async function updateOrderStatusAction(id: string, newStatus: string) {
  try {
    await Order.updateOne({ _id: id }, { $set: { status: newStatus as any } }, { runValidators: true });
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error: any) {
    console.error("Update Order Status Error:", error);
    return { error: error.message || "Lỗi khi cập nhật trạng thái đơn hàng" };
  }
}

export async function updatePaymentStatusAction(id: string, newStatus: string) {
  try {
    await Order.updateOne({ _id: id }, { $set: { paymentStatus: newStatus as any } }, { runValidators: true });
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error: any) {
    console.error("Update Payment Status Error:", error);
    return { error: error.message || "Lỗi khi cập nhật trạng thái thanh toán" };
  }
}
