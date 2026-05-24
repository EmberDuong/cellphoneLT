import { uploadAndRemoveBackground } from "@cellphonelt/ai-pipeline/image";
import { analyseImage } from "@cellphonelt/ai-pipeline/vision";
import { generateProductSpec } from "@cellphonelt/ai-pipeline/llm";
import { db, products } from "@cellphonelt/db";
import type { AiPipelineJob } from "@cellphonelt/shared-types";

/**
 * Core AI product generation processor.
 *
 * Step sequence:
 *   1. Upload image to Cloudinary + remove background
 *   2. Run Google Cloud Vision OCR / label detection
 *   3. Call Gemini 1.5 Pro for structured JSON content
 *   4. Insert product record into DB as status = "draft"
 *
 * Returns the newly created product ID.
 */
export async function processAiProductJob(
  job: AiPipelineJob
): Promise<{ productId: string }> {
  console.log(`[worker] Processing job: ${JSON.stringify(job)}`);

  // ── Step 1: Image upload + background removal ─────────────────────────────
  console.log("[worker] Step 1: Uploading image to Cloudinary...");
  const { originalUrl, cleanUrl } = await uploadAndRemoveBackground(
    job.imageUrl
  );
  console.log(`[worker] Step 1 done. Clean URL: ${cleanUrl}`);

  // ── Step 2: Vision OCR + label detection ─────────────────────────────────
  console.log("[worker] Step 2: Running Google Vision analysis...");
  const { labels, ocrText } = await analyseImage(cleanUrl);
  console.log(
    `[worker] Step 2 done. Labels: [${labels.join(", ")}], OCR: "${ocrText.slice(0, 80)}"`
  );

  // ── Step 3: Gemini content generation ────────────────────────────────────
  console.log("[worker] Step 3: Calling Gemini for structured content...");
  const aiSpecs = await generateProductSpec({
    brand: job.brand,
    price: job.price,
    category: job.category,
    visionLabels: labels,
    ocrText,
    adminNotes: job.adminNotes,
  });
  console.log(`[worker] Step 3 done. SEO Title: "${aiSpecs.seoTitle}"`);

  // ── Step 4: Insert draft product into DB ─────────────────────────────────
  console.log("[worker] Step 4: Inserting draft product into database...");

  // Generate a URL-safe slug from the AI title
  const slug = aiSpecs.seoTitle
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 180)
    + "-" + Date.now().toString(36);

  const [inserted] = await db
    .insert(products)
    .values({
      name: aiSpecs.seoTitle,
      slug,
      basePrice: job.price.toString(),
      images: [cleanUrl, originalUrl],
      aiSpecs: aiSpecs as any,
      status: "draft",
    } as any)
    .returning({ id: products.id });

  console.log(`[worker] Step 4 done. Product ID: ${inserted.id}`);

  return { productId: inserted.id };
}
