import Link from "next/link";
import { notFound } from "next/navigation";
import { Order, OrderItem, Customer } from "@cellphonelt/db";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import OrderDetails from "./OrderDetails";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Fetch Order
  const order = await Order.findOne({ _id: id }).lean();
  if (!order) return notFound();

  // 2. Fetch Customer
  const customer = await Customer.findOne({ _id: order.customerId }).select("-passwordHash").lean();

  // 3. Fetch Items
  const items = await OrderItem.find({ orderId: id }).lean();

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
