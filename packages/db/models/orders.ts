import { Schema } from "mongoose";
import { baseSchema, model, ref } from "./_base";

export const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;
export const PAYMENT_METHODS = ["cod", "bank_transfer"] as const;
export const PAYMENT_STATUSES = ["pending", "paid", "refunded"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface ShippingAddress {
  fullName: string;
  phoneNumber: string;
  address: string;
  city: string;
  note?: string;
}

// Orders — customer purchase records
export interface IOrder {
  _id: string;
  id: string;
  customerId: string;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: ShippingAddress;
  paymentMethod: (typeof PAYMENT_METHODS)[number];
  paymentStatus: (typeof PAYMENT_STATUSES)[number];
  createdAt: Date;
  updatedAt: Date;
}

const shippingAddressSchema = new Schema<ShippingAddress>(
  {
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    note: { type: String },
  },
  { _id: false }
);

const orderSchema = baseSchema({
  customerId: ref("Customer", true),
  status: { type: String, enum: ORDER_STATUSES, default: "pending", required: true, index: true },
  totalAmount: { type: Number, required: true },
  shippingAddress: { type: shippingAddressSchema, required: true },
  paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
  paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: "pending", required: true },
});
orderSchema.index({ createdAt: -1 });

export const Order = model<IOrder>("Order", orderSchema, "orders");

// Order Items — line items per order (price/name snapshot at purchase time)
export interface IOrderItem {
  _id: string;
  id: string;
  orderId: string;
  productId?: string | null;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  createdAt: Date;
}

const orderItemSchema = baseSchema(
  {
    orderId: ref("Order", true),
    productId: ref("Product"),
    productName: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    subtotal: { type: Number, required: true },
  },
  { updatedAt: false }
);

export const OrderItem = model<IOrderItem>("OrderItem", orderItemSchema, "order_items");
