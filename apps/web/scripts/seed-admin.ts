import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import * as bcrypt from "bcryptjs";

async function main() {
  console.log("Seeding admin account...");
  
  const { db, eq, staff } = await import("@cellphonelt/db");

  const email = "admin@cellphonelt.com";
  const plainPassword = "admin";
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  try {
    const existing = await db.query.staff.findFirst({ where: eq(staff.email, email) });
    if (existing) {
       console.log("Account already exists. Skipping.");
    } else {
      await db.insert(staff).values({
        fullName: "Super Admin",
        email,
        passwordHash,
        role: "admin",
        isActive: true,
      } as any);
      console.log(`Admin account created!`);
    }

    console.log(`Email: ${email}`);
    console.log(`Password: ${plainPassword}`);
  } catch (err) {
    console.error("Error creating admin account:", err);
  } finally {
    process.exit(0);
  }
}

main();
