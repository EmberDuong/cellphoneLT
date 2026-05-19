import { db } from "../index";
import { staff } from "../schema/lookup";
import * as bcrypt from "bcryptjs";

async function main() {
  console.log("Seeding admin account...");
  
  const email = "admin@cellphonelt.com";
  const plainPassword = "admin";
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  try {
    await db.insert(staff).values({
      fullName: "Super Admin",
      email,
      passwordHash,
      role: "admin",
      isActive: true,
    }).onConflictDoNothing(); // Prevent error if it already exists

    console.log(`Admin account created!`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${plainPassword}`);
  } catch (err) {
    console.error("Error creating admin account:", err);
  } finally {
    process.exit(0);
  }
}

main();
