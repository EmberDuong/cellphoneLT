import {
  GoogleGenerativeAI,
  SchemaType,
  type FunctionDeclarationSchema,
} from "@google/generative-ai";
import type { AiProductSpec } from "@cellphonelt/shared-types";

// ─── JSON Schema for the structured output ───────────────────────────────────
// Mirrors AiProductSpecSchema from shared-types so the LLM is forced to return
// exactly the shape expected by the rest of the pipeline.
const AI_SPEC_SCHEMA: FunctionDeclarationSchema = {
  type: SchemaType.OBJECT,
  properties: {
    seoTitle: {
      type: SchemaType.STRING,
      description: "SEO-optimised product title ≤60 characters, in Vietnamese",
    },
    metaDescription: {
      type: SchemaType.STRING,
      description:
        "Compelling meta description ≤160 characters, in Vietnamese",
    },
    description: {
      type: SchemaType.STRING,
      description:
        "Rich product description 2-4 paragraphs in Vietnamese highlighting key benefits",
    },
    features: {
      type: SchemaType.ARRAY,
      description: "Up to 8 bullet-point feature highlights in Vietnamese",
      items: { type: SchemaType.STRING },
    },
    specs: {
      type: SchemaType.ARRAY,
      description:
        "Technical specifications as key-value pairs, labels in Vietnamese",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          label: { type: SchemaType.STRING },
          value: { type: SchemaType.STRING },
        },
        required: ["label", "value"],
      },
    },
    tags: {
      type: SchemaType.ARRAY,
      description: "Up to 20 lowercase search tags in Vietnamese and English",
      items: { type: SchemaType.STRING },
    },
    compatibleModels: {
      type: SchemaType.ARRAY,
      description:
        "Phone or device model names this product is compatible with",
      items: { type: SchemaType.STRING },
    },
    colors: {
      type: SchemaType.ARRAY,
      description: "Color variants available",
      items: { type: SchemaType.STRING },
    },
    material: {
      type: SchemaType.STRING,
      description: "Primary material (e.g. silicone, polycarbonate, leather)",
    },
  },
  required: [
    "seoTitle",
    "metaDescription",
    "description",
    "features",
    "specs",
    "tags",
    "compatibleModels",
    "colors",
  ],
};

export type LlmInput = {
  brand: string;
  price: number;
  category?: string;
  visionLabels: string[];
  ocrText: string;
  adminNotes?: string;
};

/**
 * Call Gemini 1.5 Pro with structured JSON output to generate full
 * product content from vision data.
 */
export async function generateProductSpec(
  input: LlmInput
): Promise<AiProductSpec> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: AI_SPEC_SCHEMA as any,
      temperature: 0.4,
    },
  });

  const prompt = buildPrompt(input);

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Parse and return — the schema enforcement means this rarely throws
  const parsed: AiProductSpec = JSON.parse(text);
  return parsed;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function buildPrompt(input: LlmInput): string {
  const parts: string[] = [
    `Bạn là chuyên gia content marketing thương mại điện tử Việt Nam, chuyên ngành phụ kiện điện thoại.`,
    ``,
    `Thông tin sản phẩm cần tạo nội dung:`,
    `- Thương hiệu: ${input.brand}`,
    `- Giá bán: ${input.price.toLocaleString("vi-VN")} VNĐ`,
  ];

  if (input.category) {
    parts.push(`- Danh mục: ${input.category}`);
  }
  if (input.visionLabels.length > 0) {
    parts.push(`- Google Vision nhận diện: ${input.visionLabels.join(", ")}`);
  }
  if (input.ocrText) {
    parts.push(`- Văn bản trên ảnh (OCR): ${input.ocrText}`);
  }
  if (input.adminNotes) {
    parts.push(`- Ghi chú từ admin: ${input.adminNotes}`);
  }

  parts.push(
    ``,
    `Hãy tạo đầy đủ nội dung sản phẩm theo chuẩn JSON schema đã định nghĩa.`,
    `Viết bằng tiếng Việt, ngôn ngữ marketing chuyên nghiệp, phù hợp với khách hàng Việt Nam.`,
    `Đảm bảo SEO title và meta description tối ưu cho Google Search.`
  );

  return parts.join("\n");
}
