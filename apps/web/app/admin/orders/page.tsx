import type { Metadata } from "next";
import { db, orders, customers, eq, desc } from "@cellphonelt/db";
import { SalesDashboardClient } from "./SalesDashboardClient";

export const metadata: Metadata = { title: "Đơn hàng" };
export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const allOrders = await db
    .select({
      id: orders.id,
      customerName: customers.fullName,
      totalAmount: orders.totalAmount,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .leftJoin(customers, eq(orders.customerId, customers.id))
    .orderBy(desc(orders.createdAt));

  return (
    <>
      <header className="admin-topbar">
        <h1 className="admin-topbar-title">Quản lý bán hàng & Đơn hàng</h1>
      </header>

      <main className="admin-content">
        <SalesDashboardClient orders={allOrders} />
      </main>
    </>
  );
}
