import type { Metadata } from "next";
import { db, customers } from "@cellphonelt/db";
import Link from "next/link";
import DeleteCustomerButton from "./DeleteCustomerButton";

export const metadata: Metadata = { title: "Khách hàng" };
export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const allCustomers = await db.select().from(customers).orderBy(customers.createdAt);

  return (
    <>
      <header className="admin-topbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 className="admin-topbar-title">Quản lý Khách hàng</h1>
        <Link href="/admin/customers/new" className="btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", textDecoration: "none" }}>
          + Thêm Khách hàng
        </Link>
      </header>

      <main className="admin-content">
        <div className="data-table-wrap">
          <div className="data-table-header">
            <h2 className="data-table-title">Tất cả khách hàng</h2>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 80 }}>ID</th>
                <th>Họ và tên</th>
                <th>Số điện thoại</th>
                <th>Điểm tích lũy</th>
                <th>Tổng chi tiêu</th>
                <th style={{ width: 120 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {allCustomers.map((c) => (
                <tr key={c.id}>
                  <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                    {c.id.substring(0, 8)}
                  </td>
                  <td style={{ fontWeight: 600 }}>{c.fullName}</td>
                  <td>{c.phoneNumber || "N/A"}</td>
                  <td>{c.loyaltyPoints}</td>
                  <td style={{ fontWeight: 600 }}>
                    {Number(c.totalLifetimeSpend).toLocaleString('vi-VN')}đ
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <Link href={`/admin/customers/${c.id}`} style={{ color: "var(--primary-glow)", fontSize: "0.875rem", textDecoration: "none" }}>Sửa</Link>
                      <DeleteCustomerButton id={c.id} />
                    </div>
                  </td>
                </tr>
              ))}
              
              {allCustomers.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>
                    Chưa có khách hàng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
