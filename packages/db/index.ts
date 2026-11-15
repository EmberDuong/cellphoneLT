import { connectDB } from "./connection";

// Open (or reuse) the MongoDB connection as soon as the package is imported.
// Mongoose buffers queries until it is ready, so models can be used directly.
connectDB().catch(() => {
  /* logged in connectDB; queries will surface the error */
});

export { connectDB, disconnectDB } from "./connection";
export { plain } from "./plugins";
export * from "./models";
export { default as mongoose } from "mongoose";

/** Escape user input before using it in a `$regex` (replacement for SQL ILIKE). */
export function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Case-insensitive "contains" match, like SQL `ILIKE '%term%'`. */
export function ilike(term: string) {
  return { $regex: escapeRegex(term), $options: "i" };
}

/** Case-insensitive exact match, like SQL `ILIKE 'term'`. */
export function iequals(term: string) {
  return { $regex: `^${escapeRegex(term)}$`, $options: "i" };
}
