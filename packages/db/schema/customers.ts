import {
  pgTable,
  uuid,
  varchar,
  integer,
  decimal,
  timestamp,
} from "drizzle-orm/pg-core";

// ────────────────────────────────────────────────
// Customers — unified profile for all service types
// ────────────────────────────────────────────────
export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),

  fullName: varchar("full_name", { length: 255 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 20 }).unique(),
  email: varchar("email", { length: 255 }),

  /**
   * Zalo User ID — used to send ZNS transactional messages.
   * Obtained when customer links Zalo via Zalo OA widget.
   */
  zaloOaId: varchar("zalo_oa_id", { length: 100 }),

  // Loyalty & analytics
  loyaltyPoints: integer("loyalty_points").default(0).notNull(),
  totalLifetimeSpend: decimal("total_lifetime_spend", {
    precision: 16,
    scale: 0,
  }).default("0"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
