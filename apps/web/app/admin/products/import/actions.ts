"use server";

import { Product } from "@cellphonelt/db";
import { revalidatePath } from "next/cache";

/** Excel cells arrive as strings/numbers; store prices as numbers (null when empty). */
function toPrice(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  return Number(value);
}

export async function importProductsAction(data: any[]) {
  try {
    if (!data || data.length === 0) return { error: "Không có dữ liệu để nhập" };

    const chunkSize = 100;
    let count = 0;

    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);

      // Fix #8 — Count only actually-inserted rows, silently skipping slug
      // conflicts (old ON CONFLICT (slug) DO NOTHING) instead of inflating the count.
      const slugs = chunk.map((row: any) => row.slug);
      const existing = await Product.find({ slug: { $in: slugs } }).select("slug").lean();
      const taken = new Set(existing.map((p) => p.slug));
      const toInsert = chunk
        .filter((row: any) => {
          if (taken.has(row.slug)) return false;
          taken.add(row.slug); // also skip duplicates within the same chunk
          return true;
        })
        .map((row: any) => ({
          ...row,
          basePrice: toPrice(row.basePrice),
          minPrice: toPrice(row.minPrice),
          maxPrice: toPrice(row.maxPrice),
        }));

      if (toInsert.length > 0) {
        const inserted = await Product.insertMany(toInsert);
        count += inserted.length;
      }
    }

    revalidatePath("/admin/products");
    return { success: true, count };
  } catch (error: any) {
    console.error("Import Products Error:", error);
    return { error: error.message || "Đã xảy ra lỗi khi nhập dữ liệu" };
  }
}
