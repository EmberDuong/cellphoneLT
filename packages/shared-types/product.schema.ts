import { z } from "zod";

// ────────────────────────────────────────────────
// AI-Generated Product Specs (Gemini output shape)
// ────────────────────────────────────────────────
export const AiProductSpecSchema = z.object({
  seoTitle: z.string().max(60),
  metaDescription: z.string().max(160),
  description: z.string(),
  features: z.array(z.string()).max(8),
  specs: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
    })
  ),
  tags: z.array(z.string()).max(20),
  compatibleModels: z.array(z.string()),
  colors: z.array(z.string()),
  material: z.string().optional(),
});

export type AiProductSpec = z.infer<typeof AiProductSpecSchema>;

// ────────────────────────────────────────────────
// Create / Update Product
// ────────────────────────────────────────────────
export const CreateProductSchema = z.object({
  name: z.string().min(2).max(255),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  sku: z.string().max(100).optional(),
  brandId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  basePrice: z.number().positive(),
  minPrice: z.number().positive().optional().nullable(),
  maxPrice: z.number().positive().optional().nullable(),
  isSerialized: z.boolean().default(false),
  aiSpecs: AiProductSpecSchema.optional(),
  images: z.array(z.string().url()).default([]),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
}).refine(
  (data) => !data.minPrice || !data.maxPrice || data.minPrice <= data.maxPrice,
  {
    message: "Giá tối thiểu phải nhỏ hơn hoặc bằng giá tối đa",
    path: ["maxPrice"],
  }
);

export type CreateProduct = z.infer<typeof CreateProductSchema>;


// ────────────────────────────────────────────────
// AI Pipeline Job Input
// ────────────────────────────────────────────────
export const AiPipelineJobSchema = z.object({
  imageUrl: z.string().url(),          // Cloudinary upload URL
  brand: z.string(),
  price: z.number().positive(),
  category: z.string().optional(),
  adminNotes: z.string().optional(),
});

export type AiPipelineJob = z.infer<typeof AiPipelineJobSchema>;
