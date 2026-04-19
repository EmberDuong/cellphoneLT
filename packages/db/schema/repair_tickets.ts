import {
  pgTable,
  uuid,
  varchar,
  integer,
  decimal,
  timestamp,
  pgEnum,
  jsonb,
  text,
} from "drizzle-orm/pg-core";
import { customers } from "./customers";
import { staff } from "./lookup";

// ────────────────────────────────────────────────
// Enums
// ────────────────────────────────────────────────
export const repairStatusEnum = pgEnum("repair_status", [
  "intake",           // device just received at counter
  "diagnosing",       // technician assessing the issue
  "awaiting_parts",   // parts out of stock, on backorder
  "in_progress",      // active repair work
  "quality_check",    // final QA before handover
  "done",             // repair complete, awaiting pickup
  "delivered",        // device returned to customer
  "cancelled",
]);

export const repairPriorityEnum = pgEnum("repair_priority", [
  "normal",
  "urgent",
  "vip",
]);

// ────────────────────────────────────────────────
// Repair Tickets
// ────────────────────────────────────────────────
export const repairTickets = pgTable("repair_tickets", {
  id: uuid("id").primaryKey().defaultRandom(),

  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id),

  technicianId: uuid("technician_id").references(() => staff.id),

  // Device info
  deviceBrand: varchar("device_brand", { length: 100 }).notNull(),
  deviceModel: varchar("device_model", { length: 150 }).notNull(),
  deviceImei: varchar("device_imei", { length: 50 }),
  deviceColor: varchar("device_color", { length: 50 }),

  // Issue
  reportedIssue: text("reported_issue").notNull(),
  technicianNotes: text("technician_notes"),

  /**
   * Physical condition recorded at intake to avoid disputes.
   * Example: { scratches: "minor", screenCracks: false, missingButtons: [] }
   */
  intakeCondition: jsonb("intake_condition"),

  // Cloudinary image URLs taken at intake
  devicePhotos: jsonb("device_photos").$type<string[]>().default([]),

  // Financials
  estimatedCost: decimal("estimated_cost", { precision: 12, scale: 0 }),
  finalCost: decimal("final_cost", { precision: 12, scale: 0 }),

  status: repairStatusEnum("status").default("intake").notNull(),
  priority: repairPriorityEnum("priority").default("normal").notNull(),

  // Appointment date (if booked online)
  appointmentAt: timestamp("appointment_at"),
  completedAt: timestamp("completed_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ────────────────────────────────────────────────
// Ticket Parts — parts consumed during a repair
// ────────────────────────────────────────────────
export const ticketParts = pgTable("ticket_parts", {
  id: uuid("id").primaryKey().defaultRandom(),

  ticketId: uuid("ticket_id")
    .notNull()
    .references(() => repairTickets.id, { onDelete: "cascade" }),

  // References inventoryItems.id — deducted from stock on assignment
  itemId: uuid("item_id").notNull(),

  quantity: integer("quantity").default(1).notNull(),
  warrantyDays: integer("warranty_days").default(90),
  costApplied: decimal("cost_applied", { precision: 12, scale: 0 }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
