"use server";

import { TradeInAppraisal, InventoryItem, Product } from "@cellphonelt/db";
import { revalidatePath } from "next/cache";

export async function updateTradeInStatusAction(id: string, newStatus: string) {
  try {
    await TradeInAppraisal.updateOne({ _id: id }, { $set: { status: newStatus as any } }, { runValidators: true });

    // Fix #6 — When a trade-in is accepted, automatically create an inventory item
    // for the acquired device so it appears in stock immediately.
    if (newStatus === "accepted") {
      const tradeIn = await TradeInAppraisal.findOne({ _id: id }).lean();

      if (tradeIn) {
        // Try to find an existing product that matches the device model
        const matchedProduct = await Product.findOne({
          slug: `${tradeIn.deviceBrand}-${tradeIn.deviceModel}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        })
          .select("_id")
          .lean();

        // Only create inventory entry if we can link to a product
        if (matchedProduct) {
          const agreedPrice = tradeIn.finalAgreedPrice ?? tradeIn.aiOfferedPrice ?? null;
          await InventoryItem.create({
            productId: matchedProduct.id,
            imeiSerial: tradeIn.deviceImei ?? null,
            quantity: 1,
            conditionGrade: "grade_b" as const, // default to grade B for trade-ins
            stockStatus: "available" as const,
            tradeInId: id,
            costPrice: agreedPrice != null ? String(agreedPrice) : null, // InventoryItem.costPrice stays a string
            notes: `Thu mua từ khách hàng – ${tradeIn.deviceBrand} ${tradeIn.deviceModel}`,
          } as any);
        }

        // Mark the accepted timestamp
        await TradeInAppraisal.updateOne({ _id: id }, { $set: { acceptedAt: new Date() } });
      }
    }

    revalidatePath(`/admin/trade-ins/${id}`);
    revalidatePath("/admin/trade-ins");
    revalidatePath("/admin/inventory");
    return { success: true };
  } catch (error: any) {
    console.error("Update Trade-in Status Error:", error);
    return { error: error.message || "Lỗi khi cập nhật trạng thái thu mua" };
  }
}

export async function updateFinalPriceAction(id: string, price: number) {
  try {
    await TradeInAppraisal.updateOne({ _id: id }, { $set: { finalAgreedPrice: Number(price) } });
    revalidatePath(`/admin/trade-ins/${id}`);
    revalidatePath("/admin/trade-ins");
    return { success: true };
  } catch (error: any) {
    console.error("Update Trade-in Price Error:", error);
    return { error: error.message || "Lỗi khi cập nhật giá thu mua" };
  }
}
