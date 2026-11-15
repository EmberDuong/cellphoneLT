import { baseSchema, model, ref } from "./_base";

export const CONDITION_GRADES = ["new", "grade_a", "grade_b", "grade_c"] as const;
export const STOCK_STATUSES = ["available", "reserved", "in_repair", "sold", "returned"] as const;

// Inventory Items — one document per physical unit / stock batch
export interface IInventoryItem {
  _id: string;
  id: string;
  productId: string;
  /** IMEI / serial for serialized products, null otherwise */
  imeiSerial?: string | null;
  /** Quantity for non-serialized products (serialized items = 1) */
  quantity: number;
  conditionGrade: (typeof CONDITION_GRADES)[number];
  warehouseLocation?: string | null;
  stockStatus: (typeof STOCK_STATUSES)[number];
  /** Link back to the trade-in appraisal this unit came from */
  tradeInId?: string | null;
  /** Purchase cost for margin calculations */
  costPrice?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const inventorySchema = baseSchema({
  productId: ref("Product", true),
  imeiSerial: { type: String, default: null },
  quantity: { type: Number, default: 1, required: true },
  conditionGrade: { type: String, enum: CONDITION_GRADES, default: "new", required: true },
  warehouseLocation: { type: String, default: null },
  stockStatus: { type: String, enum: STOCK_STATUSES, default: "available", required: true },
  tradeInId: { type: String, ref: "TradeInAppraisal", default: null },
  costPrice: { type: String, default: null },
  notes: { type: String, default: null, maxlength: 500 },
});

export const InventoryItem = model<IInventoryItem>("InventoryItem", inventorySchema, "inventory_items");
