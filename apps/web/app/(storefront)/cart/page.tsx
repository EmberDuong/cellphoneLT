"use client";

import Link from "next/link";
import { useCart } from "@/components/storefront/CartProvider";
import type { Metadata } from "next";

function formatVND(amount: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

export default function CartPage() {
  const { items, totalItems, totalPrice, removeItem, updateQty } = useCart();

  if (items.length === 0) {
    return (
      <main className="section-inner" style={{ padding: "5rem 1.5rem" }}>
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <h2>Giỏ hàng của bạn đang trống</h2>
          <p>Thêm sản phẩm vào giỏ hàng để tiến hành thanh toán</p>
          <Link href="/products" className="btn-primary" style={{ marginTop: "1.5rem" }}>
            🛍️ Khám phá sản phẩm
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="section-inner" style={{ padding: "3rem 1.5rem" }}>
      <h1 className="section-title">Giỏ hàng ({totalItems} sản phẩm)</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "2rem", marginTop: "2rem", alignItems: "flex-start" }}>
        {/* Cart Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {items.map((item) => (
            <div key={item.id} className="cart-item">
              {/* Image */}
              <div className="cart-item-img">📱</div>

              {/* Info */}
              <div className="cart-item-info">
                {item.brand && <span className="product-brand">{item.brand}</span>}
                <Link href={`/products/${item.slug}`} className="cart-item-name">
                  {item.name}
                </Link>
                <span className="cart-item-price">{formatVND(item.price)}</span>
              </div>

              {/* Qty Controls */}
              <div className="cart-qty">
                <button
                  id={`decrease-qty-${item.id}`}
                  className="qty-btn"
                  onClick={() => updateQty(item.id, item.quantity - 1)}
                  aria-label="Giảm"
                >
                  −
                </button>
                <span className="qty-value">{item.quantity}</span>
                <button
                  id={`increase-qty-${item.id}`}
                  className="qty-btn"
                  onClick={() => updateQty(item.id, item.quantity + 1)}
                  aria-label="Tăng"
                >
                  +
                </button>
              </div>

              {/* Subtotal */}
              <div className="cart-item-subtotal">
                {formatVND(item.price * item.quantity)}
              </div>

              {/* Remove */}
              <button
                id={`remove-item-${item.id}`}
                className="cart-item-remove"
                onClick={() => removeItem(item.id)}
                aria-label="Xoá sản phẩm"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="cart-summary">
          <div className="cart-summary-title">Tóm tắt đơn hàng</div>

          <div className="cart-summary-row">
            <span>Tạm tính ({totalItems} sản phẩm)</span>
            <span>{formatVND(totalPrice)}</span>
          </div>
          <div className="cart-summary-row">
            <span>Phí vận chuyển</span>
            <span style={{ color: "var(--success)" }}>Miễn phí</span>
          </div>

          <div className="cart-summary-divider" />

          <div className="cart-summary-total">
            <span>Tổng cộng</span>
            <span>{formatVND(totalPrice)}</span>
          </div>

          <Link
            id="proceed-checkout-btn"
            href="/checkout"
            className="btn-primary"
            style={{ width: "100%", marginTop: "1.5rem", justifyContent: "center" }}
          >
            Tiến hành thanh toán →
          </Link>

          <Link
            href="/products"
            className="btn-outline"
            style={{ width: "100%", marginTop: "0.75rem", justifyContent: "center", fontSize: "0.9rem" }}
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </main>
  );
}
