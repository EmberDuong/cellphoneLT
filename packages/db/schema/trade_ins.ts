import {
  pgTable,
  uuid,
  varchar,
  decimal,
  jsonb,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { customers } from "./customers";

// ────────────────────────────────────────────────
// Enums
// ────────────────────────────────────────────────
export const tradeInStatusEnum = pgEnum("trade_in_status", [
  "pending",        // submitted online, awaiting physical inspection
  "inspecting",     // device at store, technician diagnosing
  "offer_sent",     // final price offered to customer
  "accepted",       // customer accepted → triggers inventory_items creation
  "rejected",       // customer declined
  "cancelled",
]);

// ────────────────────────────────────────────────
// Trade-In Appraisals
// ────────────────────────────────────────────────
export const tradeInAppraisals = pgTable("trade_in_appraisals", {
  id: uuid("id").primaryKey().defaultRandom(),

  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id),

  // Device being sold
  deviceBrand: varchar("device_brand", { length: 100 }).notNull(),
  deviceModel: varchar("device_model", { length: 150 }).notNull(),
  deviceStorage: varchar("device_storage", { length: 50 }),
  deviceImei: varchar("device_imei", { length: 50 }),
  deviceColor: varchar("device_color", { length: 50 }),

  /**
   * Customer questionnaire answers stored as JSONB.
   * Example:
   * {
   *   screenCondition: "cracked",
   *   cameraWorking: true,
   *   batteryHealth: 82,
   *   faceIdWorking: true,
   *   hasOriginalBox: false,
   *   hasCharger: true
   * }
   */
  physicalCondition: jsonb("physical_condition").notNull(),

  /**
   * Functional status from questionnaire.
   * Example:
   * {
   *   powersOn: true,
   *   touchscreenOk: true,
   *   speakerOk: true,
   *   wifiOk: true,
   *   simSlotOk: true
   * }
   */
  functionalStatus: jsonb("functional_status"),

  // AI-calculated instant offer (shown to customer on website)
  aiOfferedPrice: decimal("ai_offered_price", { precision: 12, scale: 0 }),

  // Final price agreed after physical inspection at store
  finalAgreedPrice: decimal("final_agreed_price", { precision: 12, scale: 0 }),

  status: tradeInStatusEnum("status").default("pending").notNull(),

  // Appointment to bring the device in
  appointmentAt: timestamp("appointment_at"),
  acceptedAt: timestamp("accepted_at"),

  notes: varchar("notes", { length: 500 }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
