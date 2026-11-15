import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import * as bcrypt from "bcryptjs";

async function main() {
  const { Staff, disconnectDB } = await import("@cellphonelt/db");

  const email = "admin@cellphonelt.com";
  const plainPassword = "admin";
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  try {
    const existing = await Staff.findOne({ email }).lean();
    if (existing) {
      console.log("Updating existing account password...");
      await Staff.updateOne({ email }, { $set: { passwordHash, role: "admin", isActive: true } });
      console.log("Password updated successfully.");
    } else {
      console.log("Creating new admin account...");
      await Staff.create({
        fullName: "Super Admin",
        email,
        passwordHash,
        role: "admin",
        isActive: true,
      });
      console.log("Account created successfully.");
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
}

main();
