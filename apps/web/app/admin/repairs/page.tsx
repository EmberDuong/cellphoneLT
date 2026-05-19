import Link from "next/link";
import type { Metadata } from "next";
import { db, repairTickets, customers, eq } from "@cellphonelt/db";
import { DataTable } from "@/components/admin/ui/DataTable";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import DeleteRepairButton from "./DeleteRepairButton";

export const metadata: Metadata = { title: "Phiếu sửa chữa" };
export const dynamic = "force-dynamic";

export default async function AdminRepairsPage() {
  const tickets = await db
    .select({
      id: repairTickets.id,
      customerName: customers.fullName,
      deviceModel: repairTickets.deviceModel,
      reportedIssue: repairTickets.reportedIssue,
      status: repairTickets.status,
      priority: repairTickets.priority,
    })
    .from(repairTickets)
    .leftJoin(customers, eq(repairTickets.customerId, customers.id))
    .orderBy(repairTickets.createdAt);

  return (
    <>
      <header className="admin-topbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 className="admin-topbar-title">Dịch vụ sửa chữa</h1>
        <Link href="/admin/repairs/new" className="btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", textDecoration: "none" }}>
          + Tạo Phiếu Sửa Chữa
        </Link>
      </header>

      <main className="admin-content">
        <DataTable
          title="Tất cả phiếu sửa chữa"
          columns={["Mã phiếu", "Khách hàng", "Thiết bị", "Lỗi báo cáo", "Độ ưu tiên", "Trạng thái", <div style={{textAlign:"right"}}>Thao tác</div>]}
          isEmpty={tickets.length === 0}
        >
          {tickets.map((t) => (
            <tr key={t.id}>
              <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                #{t.id.substring(0, 8)}
              </td>
              <td style={{ fontWeight: 600 }}>{t.customerName}</td>
              <td>{t.deviceModel}</td>
              <td>{t.reportedIssue}</td>
              <td>
                <StatusBadge status={t.priority} variant={t.priority === 'urgent' ? 'danger' : 'draft'} />
              </td>
              <td>
                <StatusBadge status={t.status} />
              </td>
              <td style={{ textAlign: "right", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                <Link href={`/admin/repairs/${t.id}`} className="btn-outline-sm" style={{ padding: "0.2rem 0.6rem", fontSize: "0.8rem", textDecoration: "none" }}>
                  Chi tiết
                </Link>
                <DeleteRepairButton id={t.id} />
              </td>
            </tr>
          ))}
        </DataTable>
      </main>
    </>
  );
}
