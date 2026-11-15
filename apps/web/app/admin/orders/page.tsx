import type { Metadata } from "next";
import { Order, Customer } from "@cellphonelt/db";
import { SalesDashboardClient } from "./SalesDashboardClient";

export const metadata: Metadata = { title: "Đơn hàng" };
export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orderDocs = await Order.find({})
    .select("customerId totalAmount status paymentStatus createdAt")
    .sort({ createdAt: -1 })
    .lean();
  const customerIds = [...new Set(orderDocs.map((o) => o.customerId).filter(Boolean))];
  const customerDocs = customerIds.length
    ? await Customer.find({ _id: { $in: customerIds } }).select("fullName").lean()
    : [];
  const customerNameById = new Map(customerDocs.map((c) => [c.id, c.fullName]));
  const allOrders = orderDocs.map((o) => ({
    id: o.id,
    customerName: customerNameById.get(o.customerId) ?? null,
    // SalesDashboardClient reads totalAmount as a decimal string (old Postgres shape).
    totalAmount: String(o.totalAmount),
    status: o.status,
    paymentStatus: o.paymentStatus,
    createdAt: o.createdAt,
  }));

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
