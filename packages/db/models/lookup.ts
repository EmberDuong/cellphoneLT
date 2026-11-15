import { baseSchema, model } from "./_base";

// ─── Brands ──────────────────────────────────────────────────────────────────
export interface IBrand {
  _id: string;
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  createdAt: Date;
}
const brandSchema = baseSchema(
  {
    name: { type: String, required: true, unique: true, maxlength: 100 },
    slug: { type: String, required: true, unique: true, maxlength: 100 },
    logoUrl: { type: String, default: null },
  },
  { updatedAt: false }
);
export const Brand = model<IBrand>("Brand", brandSchema, "brands");

// ─── Categories ──────────────────────────────────────────────────────────────
export interface ICategory {
  _id: string;
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  sortOrder: number;
  createdAt: Date;
}
const categorySchema = baseSchema(
  {
    name: { type: String, required: true, maxlength: 100 },
    slug: { type: String, required: true, unique: true, maxlength: 100 },
    parentId: { type: String, ref: "Category", default: null }, // nested categories
    sortOrder: { type: Number, default: 0 },
  },
  { updatedAt: false }
);
export const Category = model<ICategory>("Category", categorySchema, "categories");

// ─── Staff ───────────────────────────────────────────────────────────────────
export const STAFF_ROLES = ["superadmin", "admin", "technician", "sales"] as const;
export interface IStaff {
  _id: string;
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
}
const staffSchema = baseSchema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, default: "technician" },
    isActive: { type: Boolean, default: true, required: true },
  },
  { updatedAt: false }
);
export const Staff = model<IStaff>("Staff", staffSchema, "staff");
