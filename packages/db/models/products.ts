import { Schema } from "mongoose";
import { baseSchema, model, ref, uniqueWhenSet } from "./_base";

export const PRODUCT_STATUSES = ["draft", "active", "archived"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

// Products — static product catalogue
export interface IProduct {
  _id: string;
  id: string;
  name: string;
  slug: string;
  sku?: string | null;
  brandId?: string | null;
  categoryId?: string | null;
  /** Prices in VND */
  basePrice?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  /**
   * AI-generated product data. Shape (enforced via Zod in shared-types):
   * { seoTitle, metaDescription, description, features[], specs[{label,value}],
   *   tags[], compatibleModels[], colors[], material? }
   */
  aiSpecs?: any;
  /** true → each unit tracked by IMEI; false → aggregate quantity */
  isSerialized: boolean;
  images: string[];
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = baseSchema({
  name: { type: String, required: true, maxlength: 255 },
  slug: { type: String, required: true, unique: true, maxlength: 255 },
  sku: { type: String, default: null },
  brandId: ref("Brand"),
  categoryId: ref("Category"),
  basePrice: { type: Number, default: null },
  minPrice: { type: Number, default: null },
  maxPrice: { type: Number, default: null },
  aiSpecs: { type: Schema.Types.Mixed, default: null },
  isSerialized: { type: Boolean, default: false, required: true },
  images: { type: [String], default: [] },
  status: { type: String, enum: PRODUCT_STATUSES, default: "draft", required: true, index: true },
});
uniqueWhenSet(productSchema, "sku");
productSchema.index({ createdAt: -1 });

export const Product = model<IProduct>("Product", productSchema, "products");
