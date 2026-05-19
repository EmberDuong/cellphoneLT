"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updateInventoryAction } from "../actions";

export default function EditInventoryForm({ 
  item,
  products 
}: { 
  item: any;
  products: { id: string; name: string }[]; 
}) {
  const updateWithId = updateInventoryAction.bind(null, item.id);
  const [state, formAction, isPending] = useActionState(updateWithId, { error: null, details: {} as any });

  return (
    <>
      <header className="admin-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/admin/inventory" style={{ color: "var(--text-muted)" }}>← Trở về</Link>
          <h1 className="admin-topbar-title">Chỉnh sửa kho</h1>
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
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.25rem" }}>Sản phẩm *</label>
              <select name="productId" className="form-input" style={{ width: "100%" }} defaultValue={item.productId} required>
                <option value="">-- Chọn sản phẩm --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {state?.details?.productId && <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>{state.details.productId[0]}</p>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.25rem" }}>IMEI / Serial</label>
                <input type="text" name="imeiSerial" defaultValue={item.imeiSerial || ""} className="form-input" style={{ width: "100%" }} placeholder="Dành cho máy cũ / thiết bị có mã riêng" />
                {state?.details?.imeiSerial && <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>{state.details.imeiSerial[0]}</p>}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.25rem" }}>Số lượng *</label>
                <input type="number" name="quantity" defaultValue={item.quantity} className="form-input" style={{ width: "100%" }} required min="1" />
                {state?.details?.quantity && <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>{state.details.quantity[0]}</p>}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.25rem" }}>Tình trạng ngoại hình *</label>
                <select name="conditionGrade" className="form-input" style={{ width: "100%" }} defaultValue={item.conditionGrade}>
                  <option value="new">Mới 100% (New)</option>
                  <option value="grade_a">Hàng loại A (Like-new, xước dăm)</option>
                  <option value="grade_b">Hàng loại B (Có trầy xước, đủ chức năng)</option>
                  <option value="grade_c">Hàng loại C (Cũ nhiều, lỗi nhẹ)</option>
                </select>
                {state?.details?.conditionGrade && <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>{state.details.conditionGrade[0]}</p>}
              </div>
              
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.25rem" }}>Trạng thái kho *</label>
                <select name="stockStatus" className="form-input" style={{ width: "100%" }} defaultValue={item.stockStatus}>
                  <option value="available">Sẵn sàng bán (Available)</option>
                  <option value="reserved">Đang giữ chỗ (Reserved)</option>
                  <option value="in_repair">Đang sửa chữa (In Repair)</option>
                  <option value="sold">Đã bán (Sold)</option>
                  <option value="returned">Khách trả hàng (Returned)</option>
                </select>
                {state?.details?.stockStatus && <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>{state.details.stockStatus[0]}</p>}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.25rem" }}>Vị trí kho</label>
                <input type="text" name="warehouseLocation" defaultValue={item.warehouseLocation || ""} className="form-input" style={{ width: "100%" }} placeholder="Vd: Kệ A1, Tầng 2" />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.25rem" }}>Giá nhập (VNĐ)</label>
                <input type="number" name="costPrice" defaultValue={item.costPrice || ""} className="form-input" style={{ width: "100%" }} />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.25rem" }}>Ghi chú thêm</label>
              <textarea name="notes" defaultValue={item.notes || ""} className="form-input" style={{ width: "100%", minHeight: 80 }} placeholder="Mô tả thêm về tình trạng, nguồn gốc..."></textarea>
            </div>

            <div style={{ paddingTop: "1rem" }}>
              <button type="submit" className="btn-primary" style={{ width: "100%", padding: "0.8rem", textAlign: "center" }} disabled={isPending}>
                {isPending ? "Đang lưu..." : "Cập nhật kho"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
