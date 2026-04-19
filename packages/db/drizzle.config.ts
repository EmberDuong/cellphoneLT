import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { join } from "path";
import dotenv from "dotenv";

dotenv.config({ path: join(__dirname, "../../.env") });

export default defineConfig({
  schema: "./schema/index.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
