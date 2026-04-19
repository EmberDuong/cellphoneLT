import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Quản lý sản phẩm" };

export default function AdminProductsPage() {
  return (
    <>
      <header className="admin-topbar">
        <h1 className="admin-topbar-title">Kho hàng hóa</h1>
        <Link href="/admin/products/new" className="btn-primary-sm">
          + Thêm bằng AI
        </Link>
      </header>

      <main className="admin-content">
        <div className="data-table-wrap">
          <div className="data-table-header">
            <h2 className="data-table-title">Tất cả sản phẩm</h2>
            <input 
              type="text" 
              placeholder="Tìm kiếm SP..." 
              className="form-input" 
              style={{ width: 250 }} 
            />
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>ID</th>
                <th>Sản phẩm</th>
                <th>Thương hiệu</th>
                <th>Giá bán</th>
                <th>Tồn kho</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: "right" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>#001</td>
                <td>
                  <div style={{ fontWeight: 600 }}>Ốp lưng iPhone 15 Pro Max</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>SKU: IP15PM-OP-01</div>
                </td>
                <td>Apple</td>
                <td style={{ fontWeight: 600 }}>350.000đ</td>
                <td>42</td>
                <td><span className="status-pill active">Đang bán</span></td>
                <td style={{ textAlign: "right" }}>
                  <button className="btn-outline-sm" style={{ padding: "0.2rem 0.6rem", fontSize: "0.8rem" }}>Sửa</button>
                </td>
              </tr>
              <tr>
                <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>#002</td>
                <td>
                  <div style={{ fontWeight: 600 }}>Cáp sạc USB-C Anker</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>SKU: AK-CBL-02</div>
                </td>
                <td>Anker</td>
                <td style={{ fontWeight: 600 }}>290.000đ</td>
                <td>0</td>
                <td><span className="status-pill draft">Hết hàng</span></td>
                <td style={{ textAlign: "right" }}>
                  <button className="btn-outline-sm" style={{ padding: "0.2rem 0.6rem", fontSize: "0.8rem" }}>Sửa</button>
                </td>
              </tr>
              <tr style={{ background: "rgba(108,71,255,0.05)" }}>
                <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>#003</td>
                <td>
                  <div style={{ fontWeight: 600, color: "var(--primary)" }}>[Bản nháp AI] Ốp UAG Pathfinder</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Cần duyệt thông tin</div>
                </td>
                <td>UAG</td>
                <td style={{ fontWeight: 600 }}>850.000đ</td>
                <td>5</td>
                <td><span className="status-pill in_repair">Chờ duyệt</span></td>
                <td style={{ textAlign: "right" }}>
                  <Link href="/products/3" className="btn-primary-sm" style={{ padding: "0.2rem 0.6rem", fontSize: "0.8rem" }}>Duyệt ngay</Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
