import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { enqueueProductGeneration } from "@cellphonelt/ai-pipeline/queue";
import { AiPipelineJobSchema } from "@cellphonelt/shared-types";

export const runtime = "nodejs";

/**
 * POST /api/ai/generate-product
 *
 * Accepts a JSON body matching AiPipelineJobSchema.
 * Enqueues the job in BullMQ and returns the job ID.
 *
 * Protected — only authenticated staff can call this.
 */
export async function POST(req: NextRequest) {
  // Auth guard
  const session = await auth();
  if (!session || (session.user as any)?.role !== "staff") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Validate input
  const parsed = AiPipelineJobSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  try {
    const jobId = await enqueueProductGeneration(parsed.data);
    return NextResponse.json({ success: true, jobId }, { status: 202 });
  } catch (err: any) {
    console.error("[api/ai/generate-product] Queue error:", err);
    return NextResponse.json(
      { error: "Failed to enqueue job. Is Redis running?" },
      { status: 503 }
    );
  }
}
