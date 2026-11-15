import mongoose from "mongoose";

/**
 * MongoDB connection (Mongoose).
 *
 * The pending connection is cached on the mongoose instance itself, not on
 * `globalThis`: Next.js can load more than one copy of mongoose (e.g. one for
 * pages and one for route handlers), and each copy needs its own connection.
 * Caching per instance also survives hot reload, because the external module
 * stays in Node's require cache. Mongoose buffers queries until it is
 * connected, so callers can use models right away; `connectDB()` is exported
 * for scripts that want to fail fast.
 */
const DEFAULT_URI = "mongodb://127.0.0.1:27017/cellphonelt";

type Cached = typeof mongoose & { __cellphoneltConnect?: Promise<typeof mongoose> | null };
const m = mongoose as Cached;

export function connectDB(): Promise<typeof mongoose> {
  if (m.connection.readyState === 1) return Promise.resolve(mongoose);
  if (!m.__cellphoneltConnect) {
    const uri = process.env.MONGODB_URI || DEFAULT_URI;
    m.__cellphoneltConnect = mongoose
      .connect(uri, { maxPoolSize: 10, serverSelectionTimeoutMS: 10_000 })
      .catch((err) => {
        m.__cellphoneltConnect = null;
        console.error("[db] MongoDB connection failed:", err.message);
        throw err;
      });
  }
  return m.__cellphoneltConnect;
}

export async function disconnectDB() {
  m.__cellphoneltConnect = null;
  await mongoose.disconnect();
}
