/**
 * Create / update MongoDB indexes for every model (replacement for SQL migrations).
 *
 *   pnpm --filter @cellphonelt/db db:indexes
 */
import { connectDB, disconnectDB, mongoose } from "../index";

async function main() {
  await connectDB();
  for (const name of mongoose.modelNames()) {
    await mongoose.model(name).syncIndexes();
    console.log(`✅ ${name}`);
  }
}

main()
  .catch((err) => {
    console.error("❌ Index sync failed:", err);
    process.exitCode = 1;
  })
  .finally(() => disconnectDB());
