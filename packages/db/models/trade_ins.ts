import { Schema } from "mongoose";
import { baseSchema, model, ref } from "./_base";

export const TRADE_IN_STATUSES = [
  "pending", // submitted online, awaiting physical inspection
  "inspecting", // device at store, technician diagnosing
  "offer_sent", // final price offered to customer
  "accepted", // customer accepted → creates inventory item
  "rejected", // customer declined
  "cancelled",
] as const;

export interface ITradeInAppraisal {
  _id: string;
  id: string;
  customerId: string;
  deviceBrand: string;
  deviceModel: string;
  deviceStorage?: string | null;
  deviceImei?: string | null;
  deviceColor?: string | null;
  /** Questionnaire answers, e.g. { screenCondition: "cracked", batteryHealth: 82 } */
  physicalCondition: any;
  /** e.g. { powersOn: true, touchscreenOk: true } */
  functionalStatus?: any;
  aiOfferedPrice?: number | null;
  finalAgreedPrice?: number | null;
  status: (typeof TRADE_IN_STATUSES)[number];
  appointmentAt?: Date | null;
  acceptedAt?: Date | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const tradeInSchema = baseSchema({
  customerId: ref("Customer", true),
  deviceBrand: { type: String, required: true },
  deviceModel: { type: String, required: true },
  deviceStorage: { type: String, default: null },
  deviceImei: { type: String, default: null },
  deviceColor: { type: String, default: null },
  physicalCondition: { type: Schema.Types.Mixed, required: true },
  functionalStatus: { type: Schema.Types.Mixed, default: null },
  aiOfferedPrice: { type: Number, default: null },
  finalAgreedPrice: { type: Number, default: null },
  status: { type: String, enum: TRADE_IN_STATUSES, default: "pending", required: true, index: true },
  appointmentAt: { type: Date, default: null },
  acceptedAt: { type: Date, default: null },
  notes: { type: String, default: null, maxlength: 500 },
});
tradeInSchema.index({ createdAt: -1 });

export const TradeInAppraisal = model<ITradeInAppraisal>(
  "TradeInAppraisal",
  tradeInSchema,
  "trade_in_appraisals"
);
