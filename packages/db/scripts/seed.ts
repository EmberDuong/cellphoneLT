/**
 * Seed MongoDB with the default Super Admin, brands, categories and a few products.
 * Safe to run multiple times (upserts by email / slug).
 *
 *   pnpm --filter @cellphonelt/db db:seed
 */
import bcrypt from "bcryptjs";
import { connectDB, disconnectDB, Staff, Brand, Category, Product } from "../index";

async function upsertBySlug(model: any, docs: Record<string, any>[]) {
  for (const doc of docs) {
    await model.updateOne({ slug: doc.slug }, { $setOnInsert: doc }, { upsert: true });
  }
}

async function main() {
  await connectDB();
  console.log("Seeding data...");

  // Indexes first so unique constraints exist before inserts
  await Promise.all([Staff, Brand, Category, Product].map((m: any) => m.syncIndexes()));

  const email = "admin@cellphonelt.com";
  const passwordHash = await bcrypt.hash("password123", 10);
  await Staff.updateOne(
    { email },
    { $setOnInsert: { fullName: "Super Admin", email, passwordHash, role: "superadmin", isActive: true } },
    { upsert: true }
  );
  console.log("✅ Super Admin seeded.");

  await upsertBySlug(Brand, [
    { name: "Apple", slug: "apple" },
    { name: "Samsung", slug: "samsung" },
    { name: "Anker", slug: "anker" },
    { name: "UAG", slug: "uag" },
  ]);
  console.log("✅ Brands seeded.");

  await upsertBySlug(Category, [
    { name: "Điện thoại", slug: "dien-thoai", sortOrder: 1 },
    { name: "Ốp lưng", slug: "op-lung", sortOrder: 2 },
    { name: "Cáp sạc", slug: "cap-sac", sortOrder: 3 },
  ]);
  console.log("✅ Categories seeded.");

  const brandId = async (slug: string) => (await Brand.findOne({ slug }).lean())?.id ?? null;
  const categoryId = async (slug: string) => (await Category.findOne({ slug }).lean())?.id ?? null;

  await upsertBySlug(Product, [
    {
      name: "Ốp lưng iPhone 15 Pro Max",
      slug: "op-lung-iphone-15-pro-max",
      sku: "IP15PM-OP-01",
      brandId: await brandId("apple"),
      categoryId: await categoryId("op-lung"),
      basePrice: 350000,
      status: "active",
    },
    {
      name: "Cáp sạc USB-C Anker",
      slug: "cap-sac-usb-c-anker",
      sku: "AK-CBL-02",
      brandId: await brandId("anker"),
      categoryId: await categoryId("cap-sac"),
      basePrice: 290000,
      status: "active",
    },
    {
      name: "[Bản nháp AI] Ốp UAG Pathfinder",
      slug: "op-uag-pathfinder-draft",
      sku: "UAG-PATH-03",
      brandId: await brandId("uag"),
      categoryId: await categoryId("op-lung"),
      basePrice: 850000,
      status: "draft",
    },
  ]);
  console.log("✅ Products seeded.");
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(() => disconnectDB());
