import { join } from "path";
import dotenv from "dotenv";

// Load environment variables FIRST before any other imports
dotenv.config({ path: join(__dirname, "../../../.env") });

import { staff, brands, categories } from "../schema/lookup";
import { products } from "../schema/products";
import bcrypt from "bcryptjs";

async function main() {
  // Use dynamic import so process.env.DATABASE_URL is evaluated AFTER dotenv.config
  const { db } = await import("../index");
  
  console.log("Seeding data...");
  
  const superAdminEmail = "admin@cellphonelt.com";
  const rawPassword = "password123";
  
  const passwordHash = await bcrypt.hash(rawPassword, 10);
  
  try {
    await db.insert(staff).values({
      fullName: "Super Admin",
      email: superAdminEmail,
      passwordHash: passwordHash,
      role: "superadmin",
      isActive: true,
    } as any).onConflictDoNothing({ target: staff.email });
    
    console.log("✅ Super Admin seed successful.");
  } catch (err: any) {
    console.error("❌ Failed to seed admin:", err);
  }

  // Seed Brands
  try {
    await db.insert(brands).values([
      { name: "Apple", slug: "apple" },
      { name: "Samsung", slug: "samsung" },
      { name: "Anker", slug: "anker" },
      { name: "UAG", slug: "uag" },
    ] as any).onConflictDoNothing({ target: brands.slug });
    console.log("✅ Brands seeded.");
  } catch (err: any) {
    console.error("❌ Failed to seed brands:", err);
  }

  // Seed Categories
  try {
    await db.insert(categories).values([
      { name: "Điện thoại", slug: "dien-thoai", sortOrder: 1 },
      { name: "Ốp lưng", slug: "op-lung", sortOrder: 2 },
      { name: "Cáp sạc", slug: "cap-sac", sortOrder: 3 },
    ] as any).onConflictDoNothing({ target: categories.slug });
    console.log("✅ Categories seeded.");
  } catch (err: any) {
    console.error("❌ Failed to seed categories:", err);
  }

  // Fetch created references
  const allBrands = await db.select().from(brands);
  const allCategories = await db.select().from(categories);

  const appleId = allBrands.find(b => b.slug === "apple")?.id;
  const ankerId = allBrands.find(b => b.slug === "anker")?.id;
  const uagId = allBrands.find(b => b.slug === "uag")?.id;

  const caseCategoryId = allCategories.find(c => c.slug === "op-lung")?.id;
  const cableCategoryId = allCategories.find(c => c.slug === "cap-sac")?.id;

  // Seed Products
  try {
    await db.insert(products).values([
      {
        name: "Ốp lưng iPhone 15 Pro Max",
        slug: "op-lung-iphone-15-pro-max",
        sku: "IP15PM-OP-01",
        brandId: appleId,
        categoryId: caseCategoryId,
        basePrice: "350000",
        status: "active",
      },
      {
        name: "Cáp sạc USB-C Anker",
        slug: "cap-sac-usb-c-anker",
        sku: "AK-CBL-02",
        brandId: ankerId,
        categoryId: cableCategoryId,
        basePrice: "290000",
        status: "active",
      },
      {
        name: "[Bản nháp AI] Ốp UAG Pathfinder",
        slug: "op-uag-pathfinder-draft",
        sku: "UAG-PATH-03",
        brandId: uagId,
        categoryId: caseCategoryId,
        basePrice: "850000",
        status: "draft",
      }
    ] as any).onConflictDoNothing({ target: products.slug });
    console.log("✅ Products seeded.");
  } catch (err: any) {
    console.error("❌ Failed to seed products:", err);
  }
  
  process.exit(0);
}

main();
