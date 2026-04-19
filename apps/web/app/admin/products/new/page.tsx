import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Tạo sản phẩm bằng AI" };

export default function AdminNewProductPage() {
  return (
    <>
      <header className="admin-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/admin/products" style={{ color: "var(--text-muted)" }}>← Trở về</Link>
          <h1 className="admin-topbar-title">Thêm sản phẩm mới</h1>
        </div>
      </header>

      <main className="admin-content" style={{ maxWidth: 800, margin: "0 auto" }}>
        
        {/* Step 1: Upload */}
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>
            Bước 1: Tải ảnh sản phẩm
          </h2>
          <div className="ai-upload-zone">
            <div className="ai-upload-icon">📸</div>
            <div className="ai-upload-heading">Kéo thả ảnh hoặc click để tải lên</div>
            <div className="ai-upload-sub">Hỗ trợ JPG, PNG. Khuyên dùng ảnh chụp từ bao bì chuẩn.</div>
            <div className="ai-badge">AI sẽ tự tách nền & nhận diện thông tin</div>
          </div>
        </div>

        {/* Step 2: Basic Info */}
        <div style={{ marginBottom: "2rem" }}>
           <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>
            Bước 2: Thông tin cơ bản
          </h2>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Thương hiệu</label>
              <select className="form-input">
                <option value="">-- Chọn thương hiệu --</option>
                <option value="apple">Apple</option>
                <option value="samsung">Samsung</option>
                <option value="anker">Anker</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Giá bán dự kiến (VND)</label>
              <input type="number" className="form-input" placeholder="Ví dụ: 350000" />
            </div>
          </div>
        </div>

        {/* Action */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid var(--border)" }}>
           <button className="btn-primary" style={{ padding: "0.8rem 2rem" }}>
             ✨ Xử lý bằng AI
           </button>
        </div>

      </main>
    </>
  );
}
