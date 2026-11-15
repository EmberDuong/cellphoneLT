"use server";

import { Order, OrderItem, InventoryItem } from "@cellphonelt/db";
import { redirect } from "next/navigation";

interface CartItemInput {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface ShippingInfo {
  fullName: string;
  phoneNumber: string;
  address: string;
  city: string;
  note?: string;
  paymentMethod: "cod" | "bank_transfer";
}

export async function placeOrder(
  customerId: string,
  cartItems: CartItemInput[],
  shipping: ShippingInfo
) {
  if (!cartItems || cartItems.length === 0) {
    throw new Error("Giỏ hàng trống.");
  }

  // Fix #10 — Check stock availability for every item BEFORE creating the order.
  // For non-serialized products we check total available quantity.
  for (const item of cartItems) {
    const stockRow = await InventoryItem.findOne({
      productId: item.id,
      stockStatus: "available",
    })
      .select("quantity")
      .lean();

    const availableQty = stockRow?.quantity ?? 0;

    if (availableQty < item.quantity) {
      throw new Error(`Sản phẩm "${item.name}" không đủ hàng trong kho. Còn lại: ${availableQty}.`);
    }
  }

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Create order
  const newOrder = await Order.create({
    customerId,
    status: "pending",
    totalAmount,
    shippingAddress: {
      fullName: shipping.fullName,
      phoneNumber: shipping.phoneNumber,
      address: shipping.address,
      city: shipping.city,
      note: shipping.note,
    },
    paymentMethod: shipping.paymentMethod,
    paymentStatus: "pending",
  });

  // Insert order items
  await OrderItem.insertMany(
    cartItems.map((item) => ({
      orderId: newOrder.id,
      productId: item.id,
      productName: item.name,
      unitPrice: Number(item.price),
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
    }))
  );

  // Fix #10 — Deduct stock from inventory for each item after order is placed.
  for (const item of cartItems) {
    const stockRow = await InventoryItem.findOne({
      productId: item.id,
      stockStatus: "available",
    })
      .select("quantity")
      .lean();

    if (stockRow) {
      const newQty = stockRow.quantity - item.quantity;
      await InventoryItem.updateOne(
        { _id: stockRow.id },
        {
          $set: {
            quantity: newQty,
            // Mark as sold if fully depleted
            stockStatus: newQty <= 0 ? ("sold" as const) : ("available" as const),
          },
        }
      );
    }
  }

  redirect(`/checkout/confirmation/${newOrder.id}`);
}
