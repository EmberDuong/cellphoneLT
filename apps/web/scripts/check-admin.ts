import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function main() {
  const { db, eq, staff } = await import("@cellphonelt/db");

  const email = "admin@cellphonelt.com";

  try {
    const user = await db.query.staff.findFirst({ where: eq(staff.email, email) });
    if (user) {
      console.log("User found:");
      console.log(JSON.stringify(user, null, 2));
    } else {
      console.log("User NOT found.");
    }
  } catch (err) {
    console.error("Error checking user:", err);
  } finally {
    process.exit(0);
  }
}

main();
