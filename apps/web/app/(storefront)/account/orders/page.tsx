import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db, eq, desc, orders } from "@cellphonelt/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đơn hàng của tôi | CellphoneLT",
};

export const dynamic = "force-dynamic";

const statusLabel: Record<string, { label: string; cls: string }> = {
  pending:    { label: "Chờ xác nhận", cls: "status-pill draft" },
  processing: { label: "Đang xử lý",   cls: "status-pill in_repair" },
  shipped:    { label: "Đang giao",     cls: "status-pill in_repair" },
  delivered:  { label: "Đã giao",       cls: "status-pill active" },
  cancelled:  { label: "Đã huỷ",        cls: "status-pill archived" },
};

function formatVND(amount: string | number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Number(amount)
  );
}

export default async function OrdersPage() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "customer") {
    redirect("/account/login");
  }

  const customerId = (session.user as any).id as string;

  const myOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.customerId, customerId))
    .orderBy(desc(orders.createdAt));

  return (
    <main className="section-inner" style={{ padding: "3rem 1.5rem", maxWidth: 900 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
        <div>
          <Link href="/account" style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
            ← Tài khoản
          </Link>
          <h1 className="section-title" style={{ marginTop: "0.25rem" }}>Đơn hàng của tôi</h1>
        </div>
      </div>

      {myOrders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h2>Chưa có đơn hàng nào</h2>
          <p>Khám phá phụ kiện điện thoại của chúng tôi nhé!</p>
          <Link href="/products" className="btn-primary" style={{ marginTop: "1.5rem" }}>
            🛍️ Mua sắm ngay
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {myOrders.map((order) => {
            const statusInfo = statusLabel[order.status] ?? statusLabel.pending;
            const shippingAddr = order.shippingAddress as any;
            return (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="order-row"
              >
                <div className="order-row-left">
                  <div className="order-id">#{order.id.slice(0, 8).toUpperCase()}</div>
                  <div className="order-meta">
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")} •{" "}
                    {shippingAddr?.city || ""}
                  </div>
                </div>
                <div className="order-row-right">
                  <span className={statusInfo.cls}>{statusInfo.label}</span>
                  <span className="order-total">{formatVND(order.totalAmount)}</span>
                  <span style={{ color: "var(--text-faint)" }}>→</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
