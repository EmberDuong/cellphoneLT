import "dotenv/config";
import { Worker } from "bullmq";
import { AI_PRODUCT_QUEUE } from "@cellphonelt/ai-pipeline/queue";
import { processAiProductJob } from "./processors/ai-product.processor";
import type { AiPipelineJob } from "@cellphonelt/shared-types";
import { createClient } from "redis";

// ─── Redis Connection ─────────────────────────────────────────────────────────
const url = process.env.REDIS_URL ?? "redis://localhost:6379";
const parsed = new URL(url);
const connection = {
  host: parsed.hostname,
  port: Number(parsed.port) || 6379,
  password: parsed.password || undefined,
  username: parsed.username || undefined,
  ...(parsed.protocol === "rediss:" ? { tls: { rejectUnauthorized: false } } : {}),
};

const banner = `
╔══════════════════════════════════════╗
║  cellphoneLT AI Worker  🤖           ║
║  Queue: ${AI_PRODUCT_QUEUE.padEnd(28)}║
║  Redis: ${(connection.host + ":" + connection.port).padEnd(28)}║
╚══════════════════════════════════════╝
`;

async function start() {
  console.log(banner);

  // ─── Check Redis availability before starting ─────────────────────────────
  const probe = createClient({ url });
  try {
    await probe.connect();
    await probe.ping();
    await probe.disconnect();
    console.log("[worker] ✅ Redis connection OK");
  } catch (err) {
    console.error("[worker] ❌ Redis is not reachable at", url);
    console.error("[worker]    Please start Redis (e.g. `redis-server`) and restart the worker.");
    console.error("[worker]    The web app (chatbots, storefront) will still work without Redis.");
    process.exit(0); // Exit cleanly — no crash loop
  }

  // ─── Worker ───────────────────────────────────────────────────────────────────
  const worker = new Worker<AiPipelineJob>(
    AI_PRODUCT_QUEUE,
    async (job) => {
      console.log(`\n[worker] 🚀 Job received: ${job.id} — brand: ${job.data.brand}`);
      const result = await processAiProductJob(job.data);
      console.log(`[worker] ✅ Job ${job.id} complete. Product ID: ${result.productId}\n`);
      return result;
    },
    {
      connection,
      concurrency: 2,
      limiter: { max: 5, duration: 60_000 },
    }
  );

  worker.on("completed", (job, result) => {
    console.log(`[worker] ✓ Completed job ${job.id}:`, result);
  });

  worker.on("failed", (job, err) => {
    console.error(`[worker] ✗ Failed job ${job?.id}:`, err.message);
  });

  worker.on("error", (err) => {
    console.error("[worker] Worker error:", err);
  });

  // ─── Graceful shutdown ────────────────────────────────────────────────────────
  async function shutdown(signal: string) {
    console.log(`\n[worker] Received ${signal}. Shutting down gracefully...`);
    await worker.close();
    console.log("[worker] Worker closed. Bye! 👋");
    process.exit(0);
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  console.log("[worker] 🟢 Worker is running and waiting for jobs...");
}

start();
