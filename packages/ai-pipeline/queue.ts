import { Queue } from "bullmq";
import type { AiPipelineJob } from "@cellphonelt/shared-types";

export const AI_PRODUCT_QUEUE = "ai-product-pipeline";

/**
 * Redis connection options.
 * BullMQ reads these from the environment at runtime.
 */
function getRedisConnection() {
  const url = process.env.REDIS_URL ?? "redis://localhost:6379";
  // Parse redis://[user:pass@]host:port
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: Number(parsed.port) || 6379,
    password: parsed.password || undefined,
    username: parsed.username || undefined,
    // TLS for production Redis (e.g. Upstash)
    ...(parsed.protocol === "rediss:"
      ? { tls: { rejectUnauthorized: false } }
      : {}),
  };
}

// Singleton queue instance — safe to import from Next.js API routes
// because BullMQ queues are light-weight (no worker threads).
let _queue: Queue<AiPipelineJob> | null = null;

export function getAiProductQueue(): Queue<AiPipelineJob> {
  if (!_queue) {
    _queue = new Queue<AiPipelineJob>(AI_PRODUCT_QUEUE, {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: 100, // keep last 100 completed jobs for audit
        removeOnFail: 50,
      },
    });
  }
  return _queue;
}

/**
 * Convenience: add a job to the AI product pipeline queue.
 */
export async function enqueueProductGeneration(
  job: AiPipelineJob
): Promise<string> {
  const queue = getAiProductQueue();
  const added = await queue.add("generate", job);
  return added.id!;
}
