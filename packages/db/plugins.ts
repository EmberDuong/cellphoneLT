import { randomUUID } from "crypto";
import type { Schema } from "mongoose";

/** String UUID primary key — keeps ids identical in shape to the old Postgres UUIDs. */
export const uuidId = { type: String, default: () => randomUUID() } as const;

/**
 * Recursively rename `_id` → `id` and drop `__v` on plain objects.
 * Lean docs then serialize cleanly into Client Components and JSON responses.
 */
export function plain<T = any>(value: any): T {
  if (Array.isArray(value)) return value.map((v) => plain(v)) as T;
  if (
    value === null ||
    typeof value !== "object" ||
    value instanceof Date ||
    (value as any)._bsontype // ObjectId / Decimal128 etc.
  ) {
    return value;
  }
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(value)) {
    if (k === "__v") continue;
    out[k === "_id" ? "id" : k] = plain(v);
  }
  return out as T;
}

/**
 * Schema plugin: every `.lean()` query result gets `id` instead of `_id`,
 * and hydrated documents serialize with `id` too.
 */
export function idPlugin(schema: Schema) {
  const opts = {
    virtuals: true,
    versionKey: false,
    transform: (_doc: any, ret: any) => {
      delete ret._id;
      return ret;
    },
  };
  schema.set("toJSON", opts);
  schema.set("toObject", opts);

  const transformLean = function (this: any, res: any) {
    if (!res || !this._mongooseOptions?.lean) return;
    if (Array.isArray(res)) {
      for (let i = 0; i < res.length; i++) res[i] = plain(res[i]);
    } else if (typeof res === "object") {
      const converted = plain(res);
      for (const key of Object.keys(res)) delete res[key];
      Object.assign(res, converted);
    }
  };
  schema.post(["find", "findOne", "findOneAndUpdate", "findOneAndDelete"] as any, transformLean);
}
