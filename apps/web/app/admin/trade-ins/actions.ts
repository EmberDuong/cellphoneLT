"use server";

import { db, tradeInAppraisals, inventoryItems, products, eq } from "@cellphonelt/db";
import { revalidatePath } from "next/cache";

export async function updateTradeInStatusAction(id: string, newStatus: string) {
  try {
    await db.update(tradeInAppraisals).set({ status: newStatus as any } as any).where(eq(tradeInAppraisals.id, id));

    // Fix #6 — When a trade-in is accepted, automatically create an inventory item
    // for the acquired device so it appears in stock immediately.
    if (newStatus === "accepted") {
      const [tradeIn] = await db.select().from(tradeInAppraisals).where(eq(tradeInAppraisals.id, id));

      if (tradeIn) {
        // Try to find an existing product that matches the device model
        const [matchedProduct] = await db
          .select({ id: products.id })
          .from(products)
          .where(eq(products.slug, `${tradeIn.deviceBrand}-${tradeIn.deviceModel}`.toLowerCase().replace(/[^a-z0-9]+/g, "-")))
          .limit(1);

        // Only create inventory entry if we can link to a product
        if (matchedProduct) {
          await db.insert(inventoryItems).values({
            productId: matchedProduct.id,
            imeiSerial: tradeIn.deviceImei ?? null,
            quantity: 1,
            conditionGrade: "grade_b" as const, // default to grade B for trade-ins
            stockStatus: "available" as const,
            tradeInId: id,
            costPrice: tradeIn.finalAgreedPrice ?? tradeIn.aiOfferedPrice ?? null,
            notes: `Thu mua từ khách hàng – ${tradeIn.deviceBrand} ${tradeIn.deviceModel}`,
          } as any);
        }

        // Mark the accepted timestamp
        await db.update(tradeInAppraisals)
          .set({ acceptedAt: new Date() } as any)
          .where(eq(tradeInAppraisals.id, id));
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
    await db.update(tradeInAppraisals).set({ finalAgreedPrice: price.toString() } as any).where(eq(tradeInAppraisals.id, id));
    revalidatePath(`/admin/trade-ins/${id}`);
    revalidatePath("/admin/trade-ins");
    return { success: true };
  } catch (error: any) {
    console.error("Update Trade-in Price Error:", error);
    return { error: error.message || "Lỗi khi cập nhật giá thu mua" };
  }
}
