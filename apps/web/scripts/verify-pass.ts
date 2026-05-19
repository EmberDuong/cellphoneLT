import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import * as bcrypt from "bcryptjs";

async function main() {
  const { db, eq, staff } = await import("@cellphonelt/db");

  const email = "admin@cellphonelt.com";
  const plainPassword = "admin";

  try {
    const user = await db.query.staff.findFirst({ where: eq(staff.email, email) });
    if (user) {
      console.log("User found. Comparing password...");
      const match = await bcrypt.compare(plainPassword, user.passwordHash);
      console.log("Match result:", match);
      
      // Also try to hash and compare manually
      const newHash = await bcrypt.hash(plainPassword, 10);
      const matchWithNewHash = await bcrypt.compare(plainPassword, newHash);
      console.log("Match with newly generated hash:", matchWithNewHash);
    } else {
      console.log("User NOT found.");
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    process.exit(0);
  }
}

main();
