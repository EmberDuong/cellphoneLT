"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updateCustomerAction } from "../actions";

export default function EditCustomerForm({ customer }: { customer: any }) {
  const updateWithId = updateCustomerAction.bind(null, customer.id);
  const [state, formAction, isPending] = useActionState(updateWithId, { error: null, details: {} as any });

  return (
    <>
      <header className="admin-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/admin/customers" style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
            ← Trở về
          </Link>
          <h1 className="admin-topbar-title">Chỉnh sửa Khách hàng</h1>
        </div>
      </header>

      <main className="admin-content" style={{ maxWidth: 860, margin: "0 auto" }}>
        <div className="form-card">
          <h2 className="form-card-title">
            <span style={{ fontSize: "1.1rem" }}>✏️</span>
            Chỉnh sửa thông tin khách hàng
          </h2>

          <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {state?.error && (
              <div className="form-error-block">
                ⚠️ {state.error}
              </div>
            )}

            {/* Full Name */}
            <div className="form-group">
              <label className="form-label">
                Họ và tên <span className="required-star">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                defaultValue={customer.fullName}
                className="form-input"
                required
              />
              {state?.details?.fullName && (
                <p className="form-field-error">⚠ {state.details.fullName[0]}</p>
              )}
            </div>

            {/* Phone + Email */}
            <div className="form-section-label">Liên hệ</div>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Số điện thoại</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  defaultValue={customer.phoneNumber || ""}
                  className="form-input"
                />
                {state?.details?.phoneNumber && (
                  <p className="form-field-error">⚠ {state.details.phoneNumber[0]}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={customer.email || ""}
                  className="form-input"
                />
                {state?.details?.email && (
                  <p className="form-field-error">⚠ {state.details.email[0]}</p>
                )}
              </div>
            </div>

            {/* Zalo + Loyalty Points */}
            <div className="form-section-label">Thông tin khác</div>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Zalo OA ID</label>
                <input
                  type="text"
                  name="zaloOaId"
                  defaultValue={customer.zaloOaId || ""}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Điểm tích lũy</label>
                <input
                  type="number"
                  name="loyaltyPoints"
                  defaultValue={customer.loyaltyPoints}
                  className="form-input"
                  min="0"
                />
              </div>
            </div>

            {/* Submit */}
            <div style={{ paddingTop: "0.5rem", display: "flex", gap: "1rem" }}>
              <button
                type="submit"
                className="btn-primary"
                style={{ flex: 1 }}
                disabled={isPending}
              >
                {isPending ? "⏳ Đang lưu..." : "✓ Cập nhật thông tin"}
              </button>
              <Link
                href="/admin/customers"
                className="btn-outline"
                style={{ padding: "0.85rem 1.5rem" }}
              >
                Huỷ
              </Link>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
