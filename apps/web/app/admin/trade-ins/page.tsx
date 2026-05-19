import Link from "next/link";
import type { Metadata } from "next";
import { db, tradeInAppraisals, customers, eq } from "@cellphonelt/db";
import { DataTable } from "@/components/admin/ui/DataTable";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";

export const metadata: Metadata = { title: "Thu mua máy" };
export const dynamic = "force-dynamic";

export default async function AdminTradeInsPage() {
  const tradeIns = await db
    .select({
      id: tradeInAppraisals.id,
      customerName: customers.fullName,
      deviceBrand: tradeInAppraisals.deviceBrand,
      deviceModel: tradeInAppraisals.deviceModel,
      aiOfferedPrice: tradeInAppraisals.aiOfferedPrice,
      status: tradeInAppraisals.status,
    })
    .from(tradeInAppraisals)
    .leftJoin(customers, eq(tradeInAppraisals.customerId, customers.id))
    .orderBy(tradeInAppraisals.createdAt);

  return (
    <>
      <header className="admin-topbar">
        <h1 className="admin-topbar-title">Thu mua thiết bị cũ</h1>
      </header>

      <main className="admin-content">
        <DataTable
          title="Tất cả yêu cầu định giá"
          columns={["Mã YC", "Khách hàng", "Thương hiệu", "Thiết bị", "Giá AI đề xuất", "Trạng thái", <div style={{textAlign:"right"}}>Thao tác</div>]}
          isEmpty={tradeIns.length === 0}
        >
          {tradeIns.map((t) => (
            <tr key={t.id}>
              <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                #{t.id.substring(0, 8)}
              </td>
              <td style={{ fontWeight: 600 }}>{t.customerName}</td>
              <td>{t.deviceBrand}</td>
              <td>{t.deviceModel}</td>
              <td style={{ fontWeight: 600 }}>
                {t.aiOfferedPrice ? `${Number(t.aiOfferedPrice).toLocaleString('vi-VN')}đ` : 'Đang tính...'}
              </td>
              <td>
                <StatusBadge status={t.status} />
              </td>
              <td style={{ textAlign: "right" }}>
                <Link href={`/admin/trade-ins/${t.id}`} className="btn-outline-sm" style={{ padding: "0.2rem 0.6rem", fontSize: "0.8rem", textDecoration: "none" }}>
                  Chi tiết
                </Link>
              </td>
            </tr>
          ))}
        </DataTable>
      </main>
    </>
  );
}
