import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  jsonb,
} from "drizzle-orm/pg-core";
import { customers } from "./customers";

export const chatSessions = pgTable("chat_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }), // Nullable for guests
  type: varchar("type", { length: 50 }).notNull(), // 'customer' or 'admin'
  status: varchar("status", { length: 50 }).default("active").notNull(), // 'active', 'closed'
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .references(() => chatSessions.id, { onDelete: "cascade" })
    .notNull(),
  
  role: varchar("role", { length: 50 }).notNull(), // 'user', 'assistant', 'system', 'tool'
  content: text("content").notNull(),
  toolCalls: jsonb("tool_calls"), // Array of tool calls (if role = 'assistant')
  toolResultId: varchar("tool_result_id", { length: 255 }), // Which tool call this is a response to (if role = 'tool')

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
