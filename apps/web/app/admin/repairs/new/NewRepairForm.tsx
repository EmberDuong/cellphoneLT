"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createRepairAction } from "../actions";

export default function NewRepairForm({ customers }: { customers: { id: string, fullName: string, phoneNumber: string | null }[] }) {
  const [state, formAction, isPending] = useActionState(createRepairAction, { error: null, details: {} as any });

  return (
    <>
      <header className="admin-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/admin/repairs" style={{ color: "var(--text-muted)", textDecoration: "none" }}>← Trở về</Link>
          <h1 className="admin-topbar-title">Tạo phiếu sửa chữa mới</h1>
        </div>
      </header>

      <main className="admin-content" style={{ maxWidth: 800, margin: "0 auto" }}>
        <div className="card" style={{ padding: "1.5rem", background: "var(--card-bg, #fff)", borderRadius: "8px", border: "1px solid var(--border-color, #eaeaea)" }}>
          <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {state?.error && (
              <div style={{ padding: "0.75rem", background: "#fee2e2", color: "#b91c1c", borderRadius: "0.375rem", fontSize: "0.875rem" }}>
                {state.error}
              </div>
            )}

            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.25rem" }}>Khách hàng *</label>
              <select name="customerId" className="form-input" style={{ width: "100%" }} required>
                <option value="">-- Chọn khách hàng --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.fullName} {c.phoneNumber ? `(${c.phoneNumber})` : ''}</option>
                ))}
              </select>
              {state?.details?.customerId && <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>{state.details.customerId[0]}</p>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.25rem" }}>Thương hiệu thiết bị *</label>
                <input type="text" name="deviceBrand" className="form-input" style={{ width: "100%" }} required placeholder="Vd: Apple, Samsung" />
                {state?.details?.deviceBrand && <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>{state.details.deviceBrand[0]}</p>}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.25rem" }}>Dòng máy *</label>
                <input type="text" name="deviceModel" className="form-input" style={{ width: "100%" }} required placeholder="Vd: iPhone 13 Pro Max" />
                {state?.details?.deviceModel && <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>{state.details.deviceModel[0]}</p>}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.25rem" }}>Số IMEI / Serial</label>
                <input type="text" name="deviceImei" className="form-input" style={{ width: "100%" }} placeholder="Tùy chọn" />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.25rem" }}>Độ ưu tiên</label>
                <select name="priority" className="form-input" style={{ width: "100%" }} defaultValue="normal">
                  <option value="normal">Bình thường</option>
                  <option value="urgent">Khẩn cấp</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.25rem" }}>Tình trạng / Lỗi báo cáo *</label>
              <textarea name="reportedIssue" className="form-input" style={{ width: "100%", minHeight: 80 }} required placeholder="Mô tả chi tiết lỗi khách hàng báo..."></textarea>
              {state?.details?.reportedIssue && <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>{state.details.reportedIssue[0]}</p>}
            </div>

            <div style={{ paddingTop: "1rem" }}>
              <button type="submit" className="btn-primary" style={{ width: "100%", padding: "0.8rem", textAlign: "center" }} disabled={isPending}>
                {isPending ? "Đang tạo..." : "Tạo phiếu sửa chữa"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
