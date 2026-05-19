import Link from "next/link";
import { notFound } from "next/navigation";
import { db, orders, orderItems, customers, eq } from "@cellphonelt/db";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import OrderDetails from "./OrderDetails";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Fetch Order
  const orderArray = await db.select().from(orders).where(eq(orders.id, id));
  if (orderArray.length === 0) return notFound();
  const order = orderArray[0];

  // 2. Fetch Customer
  const customerArray = await db.select().from(customers).where(eq(customers.id, order.customerId));
  const customer = customerArray.length > 0 ? customerArray[0] : null;

  // 3. Fetch Items
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));

  return (
    <>
      <header className="admin-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/admin/orders" style={{ color: "var(--text-muted)" }}>← Trở về</Link>
          <h1 className="admin-topbar-title">Đơn hàng #{order.id.substring(0, 8)}</h1>
          <StatusBadge status={order.status} />
          <StatusBadge status={order.paymentStatus} variant={order.paymentStatus === 'paid' ? 'active' : 'draft'} />
        </div>
      </header>

      <main className="admin-content" style={{ maxWidth: 1000, margin: "0 auto" }}>
        <OrderDetails order={order} items={items} customer={customer} />
      </main>
    </>
  );
}
