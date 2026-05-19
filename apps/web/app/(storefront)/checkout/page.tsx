"use client";

import { useCart } from "@/components/storefront/CartProvider";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { placeOrder } from "./actions";

function formatVND(amount: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { data: session } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank_transfer">("cod");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!session || (session.user as any)?.role !== "customer") {
      router.push("/account/login?redirect=/checkout");
      return;
    }

    if (items.length === 0) {
      router.push("/cart");
      return;
    }

    setLoading(true);
    setOrderError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const shipping = {
      fullName: formData.get("fullName") as string,
      phoneNumber: formData.get("phoneNumber") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      note: formData.get("note") as string,
      paymentMethod,
    };

    const customerId = (session.user as any).id as string;

    try {
      await placeOrder(
        customerId,
        items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
        shipping
      );
      clearCart();
    } catch (err: any) {
      // Fix #9 — placeOrder uses redirect() which throws a special NEXT_REDIRECT
      // error. Swallow that; surface every other real error to the user.
      if (err?.message?.includes("NEXT_REDIRECT") || err?.digest?.startsWith("NEXT_REDIRECT")) {
        clearCart();
        return;
      }
      setOrderError(err?.message || "Đặt hàng thất bại. Vui lòng thử lại.");
      setLoading(false);
    }
  }


  if (items.length === 0) {
    return (
      <main className="section-inner" style={{ padding: "5rem 1.5rem", textAlign: "center" }}>
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <h2>Giỏ hàng trống</h2>
          <p>Vui lòng thêm sản phẩm trước khi thanh toán.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="section-inner" style={{ padding: "3rem 1.5rem" }}>
      <h1 className="section-title">Thanh toán</h1>

      <form onSubmit={handleSubmit}>
        <div className="checkout-grid">
          {/* Left: Shipping Form */}
          <div>
            <div className="checkout-section">
              <h2 className="checkout-section-title">📍 Thông tin giao hàng</h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group" style={{ gridColumn: "1/-1" }}>
                  <label className="form-label">Họ và tên người nhận</label>
                  <input
                    id="checkout-fullname"
                    name="fullName"
                    className="form-input"
                    placeholder="Nguyễn Văn A"
                    defaultValue={session?.user?.name || ""}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Số điện thoại</label>
                  <input
                    id="checkout-phone"
                    name="phoneNumber"
                    type="tel"
                    className="form-input"
                    placeholder="0912 345 678"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tỉnh / Thành phố</label>
                  <select id="checkout-city" name="city" className="form-input" required>
                    <option value="">Chọn tỉnh/thành</option>
                    {["Hà Nội","TP. Hồ Chí Minh","Đà Nẵng","Hải Phòng","Cần Thơ","Bình Dương","Đồng Nai","Khánh Hoà","Nghệ An","Thanh Hoá"].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: "1/-1" }}>
                  <label className="form-label">Địa chỉ cụ thể</label>
                  <input
                    id="checkout-address"
                    name="address"
                    className="form-input"
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện"
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: "1/-1" }}>
                  <label className="form-label">Ghi chú (tuỳ chọn)</label>
                  <textarea
                    id="checkout-note"
                    name="note"
                    className="form-input"
                    placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..."
                    rows={3}
                    style={{ resize: "vertical" }}
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="checkout-section" style={{ marginTop: "1.5rem" }}>
              <h2 className="checkout-section-title">💳 Phương thức thanh toán</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {[
                  { value: "cod", label: "Thanh toán khi nhận hàng (COD)", icon: "🏠", desc: "Thanh toán tiền mặt khi nhận hàng" },
                  { value: "bank_transfer", label: "Chuyển khoản ngân hàng", icon: "🏦", desc: "Vietcombank · Techcombank · MB Bank" },
                ].map((method) => (
                  <label
                    key={method.value}
                    className={`payment-option ${paymentMethod === method.value ? "selected" : ""}`}
                    onClick={() => setPaymentMethod(method.value as "cod" | "bank_transfer")}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={() => setPaymentMethod(method.value as "cod" | "bank_transfer")}
                      style={{ display: "none" }}
                    />
                    <span style={{ fontSize: "1.5rem" }}>{method.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{method.label}</div>
                      <div style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>{method.desc}</div>
                    </div>
                    <span className="payment-check">{paymentMethod === method.value ? "✓" : ""}</span>
                  </label>
                ))}
              </div>

              {paymentMethod === "bank_transfer" && (
                <div className="bank-info">
                  <p>🏦 <strong>Vietcombank</strong> — STK: <strong>1234567890</strong></p>
                  <p>Chủ tài khoản: <strong>CELLPHONELT</strong></p>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    Nội dung chuyển khoản: Họ tên + Số điện thoại
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Order Summary */}
          <div>
            <div className="cart-summary" style={{ position: "sticky", top: "80px" }}>
              <div className="cart-summary-title">📦 Đơn hàng của bạn</div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem" }}>
                {items.map((item) => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem" }}>
                    <span style={{ color: "var(--text-muted)" }}>
                      {item.name} × {item.quantity}
                    </span>
                    <span style={{ fontWeight: 600 }}>{formatVND(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="cart-summary-divider" />

              <div className="cart-summary-row">
                <span>Vận chuyển</span>
                <span style={{ color: "var(--success)" }}>Miễn phí</span>
              </div>

              <div className="cart-summary-total">
                <span>Tổng cộng</span>
                <span>{formatVND(totalPrice)}</span>
              </div>

              {!session && (
                <div style={{ padding: "0.75rem", background: "rgba(108,71,255,0.08)", borderRadius: "var(--radius-sm)", fontSize: "0.85rem", color: "var(--primary)", marginTop: "1rem" }}>
                  ⚠️ Bạn cần <a href="/account/login?redirect=/checkout" style={{ fontWeight: 700, textDecoration: "underline" }}>đăng nhập</a> để đặt hàng.
                </div>
              )}

              {orderError && (
                <div style={{ padding: "0.75rem", background: "#fee2e2", color: "#b91c1c", borderRadius: "var(--radius-sm)", fontSize: "0.85rem", marginTop: "1rem", border: "1px solid #fecaca" }}>
                  ❌ {orderError}
                </div>
              )}

              <button
                id="place-order-btn"
                type="submit"
                className="btn-primary"
                disabled={loading || !session}
                style={{ width: "100%", marginTop: "1.25rem", justifyContent: "center" }}
              >
                {loading ? "Đang xử lý..." : "✅ Đặt hàng ngay"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}
