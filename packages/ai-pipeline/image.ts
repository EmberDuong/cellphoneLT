import { v2 as cloudinary } from "cloudinary";

// ─── Configure once at import time ───────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

export type UploadResult = {
  /** Original image URL (with background) */
  originalUrl: string;
  /** Background-removed URL (Cloudinary ai_background_removal effect) */
  cleanUrl: string;
  publicId: string;
};

/**
 * Upload a product image to Cloudinary and return both the original
 * and the background-removed variant.
 *
 * @param imageSource  Either a public URL or a base64 data URI.
 * @param folder       Cloudinary folder to organise uploads (default: "cellphonelt/products").
 */
export async function uploadAndRemoveBackground(
  imageSource: string,
  folder = "cellphonelt/products"
): Promise<UploadResult> {
  // 1. Upload original
  const upload = await cloudinary.uploader.upload(imageSource, {
    folder,
    resource_type: "image",
    use_filename: false,
    unique_filename: true,
  });

  const originalUrl = upload.secure_url;
  const publicId = upload.public_id;

  // 2. Generate the bg-removed URL via eager transformation
  //    ai_background_removal is a Cloudinary premium add-on.
  //    If not available, falls back to original URL.
  let cleanUrl: string;
  try {
    const bgRemoved = await cloudinary.uploader.explicit(publicId, {
      type: "upload",
      eager: [
        {
          effect: "e_background_removal",
          format: "png",
        },
      ],
      eager_async: false,
    });
    cleanUrl =
      bgRemoved.eager?.[0]?.secure_url ?? originalUrl;
  } catch {
    // Graceful fallback — ai_background_removal not enabled on this account
    console.warn(
      "[ai-pipeline/image] Background removal failed; using original URL."
    );
    cleanUrl = originalUrl;
  }

  return { originalUrl, cleanUrl, publicId };
}
