import vision from "@google-cloud/vision";

// Lazily initialised — avoids credential errors during import when
// the package is imported server-side without a running pipeline worker.
let _client: vision.ImageAnnotatorClient | null = null;

function getClient() {
  if (!_client) {
    const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    _client = keyFilename
      ? new vision.ImageAnnotatorClient({ keyFilename })
      : new vision.ImageAnnotatorClient();
  }
  return _client;
}

export type VisionResult = {
  /** Detected labels (product type, material, colour, etc.) */
  labels: string[];
  /** OCR text found on the image (brand names, model numbers, etc.) */
  ocrText: string;
};

/**
 * Run label detection + OCR on a Cloudinary image URL.
 */
export async function analyseImage(imageUrl: string): Promise<VisionResult> {
  const client = getClient();

  const [result] = await client.annotateImage({
    image: { source: { imageUri: imageUrl } },
    features: [
      { type: "LABEL_DETECTION", maxResults: 20 },
      { type: "TEXT_DETECTION" },
      { type: "OBJECT_LOCALIZATION", maxResults: 10 },
    ],
  });

  // Extract label descriptions, filtered to plausible confidence threshold
  const labels = (result.labelAnnotations ?? [])
    .filter((l) => (l.score ?? 0) > 0.65)
    .map((l) => l.description ?? "")
    .filter(Boolean);

  // Full OCR text from the first text annotation block
  const ocrText =
    result.textAnnotations?.[0]?.description?.trim() ?? "";

  return { labels, ocrText };
}
