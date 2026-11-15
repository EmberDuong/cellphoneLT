"use server";

import { RepairTicket, TicketPart } from "@cellphonelt/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CreateRepairBookingSchema } from "@cellphonelt/shared-types";

export async function updateRepairStatusAction(ticketId: string, newStatus: string) {
  try {
    await RepairTicket.updateOne({ _id: ticketId }, { $set: { status: newStatus as any } }, { runValidators: true });
    revalidatePath(`/admin/repairs/${ticketId}`);
    revalidatePath("/admin/repairs");
    return { success: true };
  } catch (error: any) {
    console.error("Update Repair Status Error:", error);
    return { error: error.message || "Lỗi khi cập nhật trạng thái phiếu sửa chữa" };
  }
}

export async function createRepairAction(prevState: any, formData: FormData) {
  try {
    const data = {
      customerId: formData.get("customerId") as string,
      deviceBrand: formData.get("deviceBrand") as string,
      deviceModel: formData.get("deviceModel") as string,
      deviceImei: formData.get("deviceImei") as string || undefined,
      reportedIssue: formData.get("reportedIssue") as string,
      priority: formData.get("priority") as string || "normal",
    };

    const parsed = CreateRepairBookingSchema.safeParse(data);

    if (!parsed.success) {
      return {
        error: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
        details: parsed.error.flatten().fieldErrors,
      };
    }

    await RepairTicket.create({
      ...parsed.data,
      status: "intake" as const,
      priority: (parsed.data.priority ?? "normal") as "normal" | "urgent" | "vip",
    } as any);

  } catch (error: any) {
    console.error("Create Repair Error:", error);
    return { error: error.message || "Lỗi khi tạo phiếu sửa chữa" };
  }

  revalidatePath("/admin/repairs");
  redirect("/admin/repairs");
}

export async function deleteRepairAction(id: string) {
  try {
    await RepairTicket.deleteOne({ _id: id });
    // ticket_parts.ticket_id was ON DELETE CASCADE in Postgres.
    await TicketPart.deleteMany({ ticketId: id });
    revalidatePath("/admin/repairs");
    return { success: true };
  } catch (error: any) {
    console.error("Delete Repair Error:", error);
    return { error: "Không thể xóa phiếu sửa chữa này." };
  }
}
