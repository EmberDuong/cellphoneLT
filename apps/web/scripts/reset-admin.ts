import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import * as bcrypt from "bcryptjs";

async function main() {
  const { db, eq, staff } = await import("@cellphonelt/db");

  const email = "admin@cellphonelt.com";
  const plainPassword = "admin";
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  try {
    const existing = await db.query.staff.findFirst({ where: eq(staff.email, email) });
    if (existing) {
      console.log("Updating existing account password...");
      await db.update(staff).set({ passwordHash, role: "admin", isActive: true } as any).where(eq(staff.email, email));
      console.log("Password updated successfully.");
    } else {
      console.log("Creating new admin account...");
      await db.insert(staff).values({
        fullName: "Super Admin",
        email,
        passwordHash,
        role: "admin",
        isActive: true,
      } as any);
      console.log("Account created successfully.");
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    process.exit(0);
  }
}

main();
