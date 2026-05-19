import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db, eq, orders, orderItems } from "@cellphonelt/db";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Đặt hàng thành công | CellphoneLT" };

function formatVND(amount: string | number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(amount));
}

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const session = await auth();
  if (!session || (session.user as any)?.role !== "customer") {
    redirect("/account/login");
  }

  const customerId = (session.user as any).id as string;
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);

  if (!order || order.customerId !== customerId) notFound();

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  const shippingAddr = order.shippingAddress as any;

  return (
    <main className="section-inner" style={{ padding: "4rem 1.5rem", maxWidth: 680 }}>
      {/* Success Banner */}
      <div className="confirmation-banner">
        <div className="confirmation-check">✅</div>
        <h1 className="confirmation-title">Đặt hàng thành công!</h1>
        <p className="confirmation-sub">
          Cảm ơn bạn đã tin tưởng CellphoneLT. Đơn hàng của bạn đã được tiếp nhận và đang
          được xử lý.
        </p>
        <div className="confirmation-order-id">
          Mã đơn hàng: <strong>#{order.id.slice(0, 8).toUpperCase()}</strong>
        </div>
      </div>

      {/* Items Summary */}
      <div className="data-table-wrap" style={{ marginBottom: "1.5rem" }}>
        <div className="data-table-header">
          <span className="data-table-title">Sản phẩm đặt mua</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>SL</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td style={{ fontWeight: 600 }}>{item.productName}</td>
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

      {/* Delivery Info */}
      <div className="info-card" style={{ marginBottom: "1.5rem" }}>
        <div className="info-card-title">📍 Giao hàng đến</div>
        <p style={{ fontWeight: 700 }}>{shippingAddr?.fullName}</p>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{shippingAddr?.phoneNumber}</p>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{shippingAddr?.address}, {shippingAddr?.city}</p>
      </div>

      {/* Payment reminder */}
      {order.paymentMethod === "bank_transfer" && (
        <div className="bank-info" style={{ marginBottom: "1.5rem" }}>
          <p style={{ fontWeight: 700, marginBottom: "0.5rem" }}>💳 Hoàn tất thanh toán chuyển khoản:</p>
          <p>🏦 <strong>Vietcombank</strong> — STK: <strong>1234567890</strong></p>
          <p>Chủ TK: <strong>CELLPHONELT</strong></p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Nội dung: {shippingAddr?.fullName} {shippingAddr?.phoneNumber}</p>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <Link href={`/account/orders/${order.id}`} className="btn-primary">
          Xem chi tiết đơn hàng
        </Link>
        <Link href="/products" className="btn-outline">
          Tiếp tục mua sắm
        </Link>
      </div>
    </main>
  );
}
