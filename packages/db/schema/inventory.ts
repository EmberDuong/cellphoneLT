import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { products } from "./products";

// ────────────────────────────────────────────────
// Enums
// ────────────────────────────────────────────────
export const conditionGradeEnum = pgEnum("condition_grade", [
  "new",
  "grade_a",   // like-new, minor hairline scratches
  "grade_b",   // visible wear, fully functional
  "grade_c",   // heavy wear or minor functional defect
]);

export const stockStatusEnum = pgEnum("stock_status", [
  "available",
  "reserved",  // held for a pending order
  "in_repair", // currently being used in a repair job
  "sold",
  "returned",
]);

// ────────────────────────────────────────────────
// Inventory Items — one row per physical unit
// ────────────────────────────────────────────────
export const inventoryItems = pgTable("inventory_items", {
  id: uuid("id").primaryKey().defaultRandom(),

  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),

  /**
   * For serialized products (used phones, motherboards):
   *   imeiSerial = the device IMEI or hardware serial number
   * For non-serialized products (cases, cables):
   *   imeiSerial = NULL, use quantity field instead
   */
  imeiSerial: varchar("imei_serial", { length: 50 }),

  /**
   * For non-serialized products only.
   * Serialized items always have quantity = 1.
   */
  quantity: integer("quantity").default(1).notNull(),

  conditionGrade: conditionGradeEnum("condition_grade").default("new").notNull(),
  warehouseLocation: varchar("warehouse_location", { length: 100 }),
  stockStatus: stockStatusEnum("stock_status").default("available").notNull(),

  /**
   * If this item came from a trade-in, link back to that appraisal.
   * Referenced as string to avoid circular import; FK enforced via migration.
   */
  tradeInId: uuid("trade_in_id"),

  // Purchase cost for margin calculations
  costPrice: varchar("cost_price", { length: 20 }),

  notes: varchar("notes", { length: 500 }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
