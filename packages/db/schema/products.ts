import {
  pgTable,
  uuid,
  varchar,
  decimal,
  boolean,
  jsonb,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { brands, categories } from "./lookup";

// ────────────────────────────────────────────────
// Enums
// ────────────────────────────────────────────────
export const productStatusEnum = pgEnum("product_status", [
  "draft",
  "active",
  "archived",
]);

// ────────────────────────────────────────────────
// Products — static product catalogue
// ────────────────────────────────────────────────
export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Identification
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  sku: varchar("sku", { length: 100 }).unique(),

  // Classification
  brandId: uuid("brand_id").references(() => brands.id),
  categoryId: uuid("category_id").references(() => categories.id),

  // Pricing (VND — stored as integer-precision decimal)
  basePrice: decimal("base_price", { precision: 14, scale: 0 }),
  minPrice: decimal("min_price", { precision: 14, scale: 0 }),
  maxPrice: decimal("max_price", { precision: 14, scale: 0 }),

  /**
   * AI-generated product data stored as JSONB.
   * Shape (enforced in app layer via Zod):
   * {
   *   seoTitle: string
   *   metaDescription: string
   *   description: string
   *   features: string[]
   *   specs: { label: string; value: string }[]
   *   tags: string[]
   *   compatibleModels: string[]
   *   colors: string[]
   *   material?: string
   * }
   */
  aiSpecs: jsonb("ai_specs"),

  /**
   * TRUE  → each physical unit tracked by IMEI (used phones, expensive parts)
   * FALSE → managed by aggregate quantity (cases, cables, screen protectors)
   */
  isSerialized: boolean("is_serialized").default(false).notNull(),

  // Storefront images (array of Cloudinary URLs)
  images: jsonb("images").$type<string[]>().default([]),

  status: productStatusEnum("status").default("draft").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
