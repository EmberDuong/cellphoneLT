"use server";

import { db, products } from "@cellphonelt/db";
import { revalidatePath } from "next/cache";

export async function importProductsAction(data: any[]) {
  try {
    if (!data || data.length === 0) return { error: "Không có dữ liệu để nhập" };

    const chunkSize = 100;
    let count = 0;

    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);

      // Fix #8 — Use .returning() to count only actually-inserted rows,
      // skipping silent slug conflicts instead of inflating the count.
      const inserted = await db
        .insert(products)
        .values(chunk)
        .onConflictDoNothing({ target: products.slug })
        .returning({ id: products.id });

      count += inserted.length;
    }

    revalidatePath("/admin/products");
    return { success: true, count };
  } catch (error: any) {
    console.error("Import Products Error:", error);
    return { error: error.message || "Đã xảy ra lỗi khi nhập dữ liệu" };
  }
}
