"use server";

import { Product, InventoryItem, OrderItem } from "@cellphonelt/db";
import { CreateProductSchema } from "@cellphonelt/shared-types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProductAction(prevState: any, formData: FormData) {
  const imagesRaw = formData.get("images")?.toString() || "";
  const images = imagesRaw.split(",").map((s) => s.trim()).filter(Boolean);

  const rawData = {
    name: formData.get("name")?.toString() || "",
    slug: formData.get("slug")?.toString() || "",
    sku: formData.get("sku")?.toString() || undefined,
    brandId: formData.get("brandId")?.toString() || undefined,
    categoryId: formData.get("categoryId")?.toString() || undefined,
    basePrice: Number(formData.get("basePrice")?.toString() || "0"),
    minPrice: formData.get("minPrice") ? Number(formData.get("minPrice")?.toString()) : null,
    maxPrice: formData.get("maxPrice") ? Number(formData.get("maxPrice")?.toString()) : null,
    status: formData.get("status")?.toString() || "draft",
    images: images,
  };

  const parsed = CreateProductSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      error: "Vui lòng kiểm tra lại thông tin.",
      details: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await Product.create({
      name: parsed.data.name,
      slug: parsed.data.slug,
      sku: parsed.data.sku || null,
      brandId: parsed.data.brandId || null,
      categoryId: parsed.data.categoryId || null,
      basePrice: parsed.data.basePrice,
      minPrice: parsed.data.minPrice ?? null,
      maxPrice: parsed.data.maxPrice ?? null,
      status: parsed.data.status as "draft" | "active" | "archived",
      images: parsed.data.images,
    } as any);
  } catch (error: any) {
    console.error("Database error:", error);
    return {
      error: "Không thể tạo sản phẩm. Có thể Slug đã tồn tại.",
      details: {},
    };
  }

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProductAction(id: string, prevState: any, formData: FormData) {
  const imagesRaw = formData.get("images")?.toString() || "";
  const images = imagesRaw.split(",").map((s) => s.trim()).filter(Boolean);

  const rawData = {
    name: formData.get("name")?.toString() || "",
    slug: formData.get("slug")?.toString() || "",
    sku: formData.get("sku")?.toString() || undefined,
    brandId: formData.get("brandId")?.toString() || undefined,
    categoryId: formData.get("categoryId")?.toString() || undefined,
    basePrice: Number(formData.get("basePrice")?.toString() || "0"),
    minPrice: formData.get("minPrice") ? Number(formData.get("minPrice")?.toString()) : null,
    maxPrice: formData.get("maxPrice") ? Number(formData.get("maxPrice")?.toString()) : null,
    status: formData.get("status")?.toString() || "draft",
    images: images,
  };

  const parsed = CreateProductSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      error: "Vui lòng kiểm tra lại thông tin.",
      details: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await Product.updateOne({ _id: id }, { $set: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      sku: parsed.data.sku || null,
      brandId: parsed.data.brandId || null,
      categoryId: parsed.data.categoryId || null,
      basePrice: parsed.data.basePrice,
      minPrice: parsed.data.minPrice ?? null,
      maxPrice: parsed.data.maxPrice ?? null,
      status: parsed.data.status as "draft" | "active" | "archived",
      images: parsed.data.images,
    } as any });
  } catch (error: any) {
    console.error("Database error:", error);
    return {
      error: "Không thể cập nhật sản phẩm. Có thể Slug đã tồn tại.",
      details: {},
    };
  }

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProductAction(id: string) {
  try {
    // Postgres FKs: inventory_items.product_id (no action → delete refused),
    // order_items.product_id (on delete set null).
    if (await InventoryItem.exists({ productId: id })) {
      throw new Error("Product is referenced by inventory items");
    }
    await Product.deleteOne({ _id: id });
    await OrderItem.updateMany({ productId: id }, { $set: { productId: null } });
    revalidatePath("/admin/products");
  } catch (error) {
    console.error("Delete error:", error);
    throw new Error("Không thể xóa sản phẩm.");
  }
}

export async function updateProductStatusAction(id: string, newStatus: string) {
  try {
    await Product.updateOne({ _id: id }, { $set: { status: newStatus as any } }, { runValidators: true });
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error: any) {
    console.error("Update Status Error:", error);
    return { error: error.message || "Lỗi cập nhật trạng thái" };
  }
}
