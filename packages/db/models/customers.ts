import { baseSchema, model, uniqueWhenSet } from "./_base";

// Customers — unified profile for all service types
export interface ICustomer {
  _id: string;
  id: string;
  fullName: string;
  phoneNumber?: string | null;
  email?: string | null;
  /** Storefront self-registration auth (null for admin-created records) */
  passwordHash?: string | null;
  emailVerified: boolean;
  /** Zalo User ID — used to send ZNS transactional messages. */
  zaloOaId?: string | null;
  loyaltyPoints: number;
  totalLifetimeSpend: number;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = baseSchema({
  fullName: { type: String, required: true },
  phoneNumber: { type: String, default: null },
  email: { type: String, default: null, lowercase: true, trim: true },
  passwordHash: { type: String, default: null },
  emailVerified: { type: Boolean, default: false, required: true },
  zaloOaId: { type: String, default: null },
  loyaltyPoints: { type: Number, default: 0, required: true },
  totalLifetimeSpend: { type: Number, default: 0 },
});
uniqueWhenSet(customerSchema, "phoneNumber");
uniqueWhenSet(customerSchema, "email");

export const Customer = model<ICustomer>("Customer", customerSchema, "customers");
