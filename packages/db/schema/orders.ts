import {
  pgTable,
  uuid,
  varchar,
  decimal,
  integer,
  jsonb,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { customers } from "./customers";
import { products } from "./products";

// ────────────────────────────────────────────────
// Enums
// ────────────────────────────────────────────────
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "cod",          // Cash on Delivery
  "bank_transfer", // Bank Transfer
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "refunded",
]);

// ────────────────────────────────────────────────
// Orders — customer purchase records
// ────────────────────────────────────────────────
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),

  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "restrict" }),

  status: orderStatusEnum("status").default("pending").notNull(),

  totalAmount: decimal("total_amount", { precision: 16, scale: 0 }).notNull(),

  /**
   * Shipping address snapshot stored as JSONB.
   * Shape: { fullName, phoneNumber, address, city, note? }
   */
  shippingAddress: jsonb("shipping_address").$type<{
    fullName: string;
    phoneNumber: string;
    address: string;
    city: string;
    note?: string;
  }>().notNull(),

  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  paymentStatus: paymentStatusEnum("payment_status").default("pending").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ────────────────────────────────────────────────
// Order Items — relational line items per order
// ────────────────────────────────────────────────
export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),

  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),

  productId: uuid("product_id")
    .references(() => products.id, { onDelete: "set null" }),

  // Price & name snapshot at time of purchase (product may change later)
  productName: varchar("product_name", { length: 255 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 14, scale: 0 }).notNull(),
  quantity: integer("quantity").notNull().default(1),
  subtotal: decimal("subtotal", { precision: 16, scale: 0 }).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
