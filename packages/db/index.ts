import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

// Connection pool — reused across the whole app
const client = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });

// Re-export schema and types for convenience
export * from "./schema";
export type { InferInsertModel, InferSelectModel } from "drizzle-orm";
