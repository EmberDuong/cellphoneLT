import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function main() {
  const { Staff, disconnectDB } = await import("@cellphonelt/db");

  const email = "admin@cellphonelt.com";

  try {
    const user = await Staff.findOne({ email }).lean();
    if (user) {
      console.log("User found:");
      console.log(JSON.stringify(user, null, 2));
    } else {
      console.log("User NOT found.");
    }
  } catch (err) {
    console.error("Error checking user:", err);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
}

main();
