import mongoose, { Schema, type Model, type SchemaDefinition } from "mongoose";
import { idPlugin, uuidId } from "../plugins";

type BaseOpts = { updatedAt?: boolean };

/** Build a schema with a UUID `_id`, timestamps and the id plugin. */
export function baseSchema(def: SchemaDefinition, opts: BaseOpts = {}): Schema<any> {
  // Explicit <any>: letting Mongoose infer the doc type from the definition
  // makes tsc run out of memory. Model typing comes from the interfaces instead.
  const schema = new Schema<any>(
    { _id: uuidId, ...def } as SchemaDefinition<any>,
    {
      timestamps: { createdAt: true, updatedAt: opts.updatedAt ?? true },
      versionKey: false,
    }
  );
  schema.plugin(idPlugin);
  return schema;
}

/** Re-use the compiled model on hot reload instead of recompiling it. */
export function model<T = any>(name: string, schema: Schema<any>, collection: string): Model<T> {
  // Cast through `any`: forwarding T into mongoose.model<T>() sends tsc into
  // an endless type expansion (out-of-memory).
  const existing = mongoose.models[name] as any;
  return (existing ?? mongoose.model(name, schema as any, collection)) as Model<T>;
}

/** Unique index that ignores documents where the field is null / missing. */
export function uniqueWhenSet(schema: Schema, field: string) {
  schema.index(
    { [field]: 1 },
    { unique: true, partialFilterExpression: { [field]: { $type: "string" } } }
  );
}

export const ref = (modelName: string, required = false) => ({
  type: String,
  ref: modelName,
  default: required ? undefined : null,
  required,
  index: true,
});
