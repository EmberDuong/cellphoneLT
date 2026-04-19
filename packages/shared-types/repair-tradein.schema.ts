import { z } from "zod";

// ────────────────────────────────────────────────
// Trade-In Physical Condition Questionnaire
// ────────────────────────────────────────────────
export const PhysicalConditionSchema = z.object({
  screenCondition: z.enum(["perfect", "minor_scratches", "cracked", "shattered"]),
  bodyCondition: z.enum(["perfect", "minor_dents", "heavy_dents"]),
  cameraWorking: z.boolean(),
  batteryHealth: z.number().min(0).max(100).optional(), // percentage
  hasOriginalBox: z.boolean().default(false),
  hasCharger: z.boolean().default(false),
  hasEarphones: z.boolean().default(false),
});

export const FunctionalStatusSchema = z.object({
  powersOn: z.boolean(),
  touchscreenOk: z.boolean(),
  speakerOk: z.boolean(),
  micOk: z.boolean(),
  wifiOk: z.boolean(),
  bluetoothOk: z.boolean(),
  simSlotOk: z.boolean(),
  faceIdOk: z.boolean().optional(),
  fingerprintOk: z.boolean().optional(),
});

// ────────────────────────────────────────────────
// Create Trade-In Appraisal
// ────────────────────────────────────────────────
export const CreateTradeInSchema = z.object({
  customerId: z.string().uuid(),
  deviceBrand: z.string().min(1),
  deviceModel: z.string().min(1),
  deviceStorage: z.string().optional(),
  deviceImei: z.string().optional(),
  deviceColor: z.string().optional(),
  physicalCondition: PhysicalConditionSchema,
  functionalStatus: FunctionalStatusSchema,
  appointmentAt: z.string().datetime().optional(),
});

export type CreateTradeIn = z.infer<typeof CreateTradeInSchema>;
export type PhysicalCondition = z.infer<typeof PhysicalConditionSchema>;
export type FunctionalStatus = z.infer<typeof FunctionalStatusSchema>;

// ────────────────────────────────────────────────
// Repair Booking
// ────────────────────────────────────────────────
export const CreateRepairBookingSchema = z.object({
  customerId: z.string().uuid(),
  deviceBrand: z.string().min(1),
  deviceModel: z.string().min(1),
  deviceImei: z.string().optional(),
  reportedIssue: z.string().min(10).max(1000),
  appointmentAt: z.string().datetime().optional(),
  priority: z.enum(["normal", "urgent", "vip"]).default("normal"),
});

export type CreateRepairBooking = z.infer<typeof CreateRepairBookingSchema>;
