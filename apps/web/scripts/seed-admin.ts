import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import * as bcrypt from "bcryptjs";

async function main() {
  console.log("Seeding admin account...");
  
  const { Staff, disconnectDB } = await import("@cellphonelt/db");

  const email = "admin@cellphonelt.com";
  const plainPassword = "admin";
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  try {
    // Upsert by email: only inserts when no staff with this email exists
    // (an existing account is left untouched, as before).
    const result = await Staff.updateOne(
      { email },
      {
        $setOnInsert: {
          fullName: "Super Admin",
          email,
          passwordHash,
          role: "admin",
          isActive: true,
        },
      },
      { upsert: true }
    );
    if (result.upsertedCount === 0) {
       console.log("Account already exists. Skipping.");
    } else {
      console.log(`Admin account created!`);
    }

    console.log(`Email: ${email}`);
    console.log(`Password: ${plainPassword}`);
  } catch (err) {
    console.error("Error creating admin account:", err);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
}

main();
