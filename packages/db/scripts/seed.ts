import "dotenv/config";
import { db } from "../index";
import { staff } from "../schema/lookup";
import bcrypt from "bcryptjs";
import { join } from "path";
import dotenv from "dotenv";

dotenv.config({ path: join(__dirname, "../../../.env") });

async function main() {
  console.log("Seeding super admin user...");
  
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
    });
    
    console.log("✅ Super Admin seed successful.");
    console.log(`Email: ${superAdminEmail}`);
    console.log(`Password: ${rawPassword}`);
  } catch (err: any) {
    if (err.code === "23505") { // Unique constraint violation (likely already seeded)
      console.log("⚠️ Super admin already exists in the database.");
    } else {
      console.error("❌ Failed to seed admin:", err);
    }
  }
  
  process.exit(0);
}

main();
