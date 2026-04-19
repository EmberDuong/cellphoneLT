import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <>
      <header className="admin-topbar">
        <h1 className="admin-topbar-title">Dashboard Tổng quan</h1>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Hôm nay: 19/04/2026</span>
          <div style={{ width: 32, height: 32, borderRadius: 99, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", fontWeight: 700 }}>A</div>
        </div>
      </header>

      <main className="admin-content">
        <div className="kpi-grid">
          <div className="kpi-card">
            <span className="kpi-label">Doanh thu hôm nay</span>
            <span className="kpi-value">12.500.000đ</span>
            <span className="kpi-change up">↑ 15% so với hôm qua</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Biên lợi nhuận gộp</span>
            <span className="kpi-value">68.5%</span>
            <span className="kpi-change up">↑ 2% tuần này</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Đơn sửa chữa đang chờ</span>
            <span className="kpi-value">14</span>
            <span className="kpi-change down">↓ 3 đơn quá hạn KPI</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Yêu cầu thu cũ đổi mới</span>
            <span className="kpi-value">5</span>
            <span className="kpi-change up">↑ 2 yêu cầu mới</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
          <div className="data-table-wrap">
            <div className="data-table-header">
              <h2 className="data-table-title">Đơn sửa chữa gần đây</h2>
              <button className="btn-outline-sm">Xem tất cả</button>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã Đơn</th>
                  <th>Khách hàng</th>
                  <th>Thiết bị</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>#REP-001</td>
                  <td>Nguyễn Văn A</td>
                  <td>iPhone 14 Pro Max</td>
                  <td><span className="status-pill in_repair">Đang sửa chữa</span></td>
                </tr>
                <tr>
                  <td>#REP-002</td>
                  <td>Trần Thị B</td>
                  <td>Samsung S23 Ultra</td>
                  <td><span className="status-pill active">Chờ linh kiện</span></td>
                </tr>
                <tr>
                  <td>#REP-003</td>
                  <td>Lê Văn C</td>
                  <td>iPad Pro M2</td>
                  <td><span className="status-pill done">Đã hoàn thành</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="data-table-wrap" style={{ display: "flex", flexDirection: "column" }}>
             <div className="data-table-header">
              <h2 className="data-table-title">Kho linh kiện sắp hết</h2>
            </div>
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>Cụm camera iPhone 13 Pro</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Chỉ còn 1 kiện</div>
                </div>
                <button className="btn-outline-sm">Nhập hàng</button>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>Màn hình Zin S22 Ultra</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Chỉ còn 0 kiện</div>
                </div>
                <button className="btn-outline-sm">Nhập hàng</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
