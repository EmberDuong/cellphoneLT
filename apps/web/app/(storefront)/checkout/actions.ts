"use server";

import { db, orders, orderItems, inventoryItems, products, eq, and } from "@cellphonelt/db";
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
    const stockRows = await db
      .select({ id: inventoryItems.id, quantity: inventoryItems.quantity })
      .from(inventoryItems)
      .where(
        and(
          eq(inventoryItems.productId, item.id),
          eq(inventoryItems.stockStatus, "available")
        )
      )
      .limit(1);

    const availableQty = stockRows[0]?.quantity ?? 0;

    if (availableQty < item.quantity) {
      throw new Error(`Sản phẩm "${item.name}" không đủ hàng trong kho. Còn lại: ${availableQty}.`);
    }
  }

  const totalAmount = cartItems
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
    .toString();

  // Create order
  const [newOrder] = await (db
    .insert(orders) as any)
    .values({
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
    })
    .returning({ id: orders.id });

  // Insert order items
  await (db.insert(orderItems) as any).values(
    cartItems.map((item) => ({
      orderId: newOrder.id,
      productId: item.id,
      productName: item.name,
      unitPrice: item.price.toString(),
      quantity: item.quantity,
      subtotal: (item.price * item.quantity).toString(),
    }))
  );

  // Fix #10 — Deduct stock from inventory for each item after order is placed.
  for (const item of cartItems) {
    const stockRows = await db
      .select({ id: inventoryItems.id, quantity: inventoryItems.quantity })
      .from(inventoryItems)
      .where(
        and(
          eq(inventoryItems.productId, item.id),
          eq(inventoryItems.stockStatus, "available")
        )
      )
      .limit(1);

    if (stockRows[0]) {
      const newQty = stockRows[0].quantity - item.quantity;
      await db
        .update(inventoryItems)
        .set({
          quantity: newQty,
          // Mark as sold if fully depleted
          stockStatus: newQty <= 0 ? ("sold" as const) : ("available" as const),
        } as any)
        .where(eq(inventoryItems.id, stockRows[0].id));
    }
  }

  redirect(`/checkout/confirmation/${newOrder.id}`);
}
