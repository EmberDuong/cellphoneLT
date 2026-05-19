import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { db, eq, orders, orderItems } from "@cellphonelt/db";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Chi tiết đơn hàng | CellphoneLT",
};

const statusSteps = [
  { key: "pending",    label: "Chờ xác nhận", icon: "🕐" },
  { key: "processing", label: "Đang xử lý",   icon: "⚙️" },
  { key: "shipped",    label: "Đang giao",     icon: "🚚" },
  { key: "delivered",  label: "Đã giao",       icon: "✅" },
];

function formatVND(amount: string | number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(amount));
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session || (session.user as any)?.role !== "customer") {
    redirect("/account/login");
  }

  const customerId = (session.user as any).id as string;

  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);

  if (!order || order.customerId !== customerId) notFound();

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));

  const shippingAddr = order.shippingAddress as any;
  const cancelledOrDelivered = order.status === "cancelled" || order.status === "delivered";
  const activeStepIndex = cancelledOrDelivered
    ? order.status === "delivered" ? 3 : -1
    : statusSteps.findIndex((s) => s.key === order.status);

  return (
    <main className="section-inner" style={{ padding: "3rem 1.5rem", maxWidth: 800 }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/account/orders" style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
          ← Đơn hàng của tôi
        </Link>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginTop: "0.25rem" }}>
          Đơn #{order.id.slice(0, 8).toUpperCase()}
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
          Đặt ngày {new Date(order.createdAt).toLocaleDateString("vi-VN", { dateStyle: "long" })}
        </p>
      </div>

      {/* Status Timeline */}
      {order.status !== "cancelled" && (
        <div className="order-timeline">
          {statusSteps.map((step, i) => (
            <div key={step.key} className={`timeline-step ${i <= activeStepIndex ? "done" : ""} ${i === activeStepIndex ? "current" : ""}`}>
              <div className="timeline-icon">{step.icon}</div>
              <div className="timeline-label">{step.label}</div>
              {i < statusSteps.length - 1 && <div className="timeline-line" />}
            </div>
          ))}
        </div>
      )}
      {order.status === "cancelled" && (
        <div className="auth-error" style={{ marginBottom: "1.5rem" }}>
          ❌ Đơn hàng này đã bị huỷ
        </div>
      )}

      {/* Order Items */}
      <div className="data-table-wrap" style={{ marginBottom: "1.5rem" }}>
        <div className="data-table-header">
          <span className="data-table-title">Sản phẩm đặt mua</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Đơn giá</th>
              <th>SL</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td style={{ fontWeight: 600 }}>{item.productName}</td>
                <td>{formatVND(item.unitPrice)}</td>
                <td>{item.quantity}</td>
                <td style={{ fontWeight: 700, color: "var(--primary)" }}>{formatVND(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
          <span style={{ color: "var(--text-muted)" }}>Tổng cộng</span>
          <span style={{ fontWeight: 800, fontSize: "1.15rem", color: "var(--primary)" }}>{formatVND(order.totalAmount)}</span>
        </div>
      </div>

      {/* Shipping & Payment */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div className="info-card">
          <div className="info-card-title">📍 Địa chỉ giao hàng</div>
          <p style={{ fontWeight: 700 }}>{shippingAddr?.fullName}</p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{shippingAddr?.phoneNumber}</p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{shippingAddr?.address}</p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{shippingAddr?.city}</p>
          {shippingAddr?.note && (
            <p style={{ color: "var(--text-faint)", fontSize: "0.85rem", marginTop: "0.5rem", fontStyle: "italic" }}>
              Ghi chú: {shippingAddr.note}
            </p>
          )}
        </div>
        <div className="info-card">
          <div className="info-card-title">💳 Thanh toán</div>
          <p style={{ fontWeight: 700 }}>
            {order.paymentMethod === "cod" ? "Thanh toán khi nhận hàng (COD)" : "Chuyển khoản ngân hàng"}
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.5rem" }}>
            Trạng thái:{" "}
            <span className={`status-pill ${order.paymentStatus === "paid" ? "active" : "draft"}`}>
              {order.paymentStatus === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
            </span>
          </p>
        </div>
      </div>
    </main>
  );
}
