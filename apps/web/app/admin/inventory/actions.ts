"use server";

import { InventoryItem, TicketPart } from "@cellphonelt/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const inventorySchema = z.object({
  productId: z.string().uuid("Vui lòng chọn sản phẩm hợp lệ"),
  imeiSerial: z.string().optional(),
  quantity: z.coerce.number().min(1, "Số lượng phải lớn hơn 0"),
  conditionGrade: z.enum(["new", "grade_a", "grade_b", "grade_c"]),
  warehouseLocation: z.string().optional(),
  stockStatus: z.enum(["available", "reserved", "in_repair", "sold", "returned"]),
  costPrice: z.string().optional(),
  notes: z.string().optional(),
});

export async function createInventoryAction(prevState: any, formData: FormData) {
  try {
    const data = {
      productId: formData.get("productId") as string,
      imeiSerial: formData.get("imeiSerial") as string || undefined,
      quantity: formData.get("quantity") || "1",
      conditionGrade: formData.get("conditionGrade") as string,
      warehouseLocation: formData.get("warehouseLocation") as string || undefined,
      stockStatus: formData.get("stockStatus") as string || "available",
      costPrice: formData.get("costPrice") as string || undefined,
      notes: formData.get("notes") as string || undefined,
    };

    const parsed = inventorySchema.safeParse(data);

    if (!parsed.success) {
      return {
        error: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
        details: parsed.error.flatten().fieldErrors,
      };
    }

    await InventoryItem.create(parsed.data as any);

  } catch (error: any) {
    console.error("Create Inventory Error:", error);
    return { error: error.message || "Đã xảy ra lỗi khi thêm tồn kho" };
  }

  revalidatePath("/admin/inventory");
  redirect("/admin/inventory");
}

export async function deleteInventoryAction(id: string) {
  try {
    // Postgres FK ticket_parts.item_id (no action) refused deleting a used item.
    if (await TicketPart.exists({ itemId: id })) {
      throw new Error("Inventory item is referenced by repair ticket parts");
    }
    await InventoryItem.deleteOne({ _id: id });
    revalidatePath("/admin/inventory");
    return { success: true };
  } catch (error) {
    console.error("Delete Inventory Error:", error);
    return { error: "Không thể xóa mục này" };
  }
}

export async function updateInventoryAction(id: string, prevState: any, formData: FormData) {
  try {
    const data = {
      productId: formData.get("productId") as string,
      imeiSerial: formData.get("imeiSerial") as string || undefined,
      quantity: formData.get("quantity") || "1",
      conditionGrade: formData.get("conditionGrade") as string,
      warehouseLocation: formData.get("warehouseLocation") as string || undefined,
      stockStatus: formData.get("stockStatus") as string || "available",
      costPrice: formData.get("costPrice") as string || undefined,
      notes: formData.get("notes") as string || undefined,
    };

    const parsed = inventorySchema.safeParse(data);

    if (!parsed.success) {
      return {
        error: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
        details: parsed.error.flatten().fieldErrors,
      };
    }

    // Undefined (empty optional) fields are skipped, as Drizzle's .set() did.
    await InventoryItem.updateOne({ _id: id }, { $set: parsed.data as any }, { runValidators: true });

  } catch (error: any) {
    console.error("Update Inventory Error:", error);
    return { error: error.message || "Đã xảy ra lỗi khi cập nhật tồn kho" };
  }

  revalidatePath("/admin/inventory");
  redirect("/admin/inventory");
}
