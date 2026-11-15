import { Schema } from "mongoose";
import { baseSchema, model, ref } from "./_base";

export const REPAIR_STATUSES = [
  "intake", // device just received at counter
  "diagnosing", // technician assessing the issue
  "awaiting_parts", // parts out of stock, on backorder
  "in_progress", // active repair work
  "quality_check", // final QA before handover
  "done", // repair complete, awaiting pickup
  "delivered", // device returned to customer
  "cancelled",
] as const;
export const REPAIR_PRIORITIES = ["normal", "urgent", "vip"] as const;

export interface IRepairTicket {
  _id: string;
  id: string;
  customerId: string;
  technicianId?: string | null;
  deviceBrand: string;
  deviceModel: string;
  deviceImei?: string | null;
  deviceColor?: string | null;
  reportedIssue: string;
  technicianNotes?: string | null;
  /** Physical condition recorded at intake, e.g. { scratches: "minor" } */
  intakeCondition?: any;
  devicePhotos: string[];
  estimatedCost?: number | null;
  finalCost?: number | null;
  status: (typeof REPAIR_STATUSES)[number];
  priority: (typeof REPAIR_PRIORITIES)[number];
  appointmentAt?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const repairTicketSchema = baseSchema({
  customerId: ref("Customer", true),
  technicianId: ref("Staff"),
  deviceBrand: { type: String, required: true },
  deviceModel: { type: String, required: true },
  deviceImei: { type: String, default: null },
  deviceColor: { type: String, default: null },
  reportedIssue: { type: String, required: true },
  technicianNotes: { type: String, default: null },
  intakeCondition: { type: Schema.Types.Mixed, default: null },
  devicePhotos: { type: [String], default: [] },
  estimatedCost: { type: Number, default: null },
  finalCost: { type: Number, default: null },
  status: { type: String, enum: REPAIR_STATUSES, default: "intake", required: true, index: true },
  priority: { type: String, enum: REPAIR_PRIORITIES, default: "normal", required: true },
  appointmentAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
});
repairTicketSchema.index({ createdAt: -1 });

export const RepairTicket = model<IRepairTicket>("RepairTicket", repairTicketSchema, "repair_tickets");

// Ticket Parts — parts consumed during a repair
export interface ITicketPart {
  _id: string;
  id: string;
  ticketId: string;
  itemId: string;
  quantity: number;
  warrantyDays?: number | null;
  costApplied?: number | null;
  createdAt: Date;
}

const ticketPartSchema = baseSchema(
  {
    ticketId: ref("RepairTicket", true),
    itemId: ref("InventoryItem", true),
    quantity: { type: Number, default: 1, required: true },
    warrantyDays: { type: Number, default: 90 },
    costApplied: { type: Number, default: null },
  },
  { updatedAt: false }
);

export const TicketPart = model<ITicketPart>("TicketPart", ticketPartSchema, "ticket_parts");
