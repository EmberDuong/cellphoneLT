import Link from "next/link";
import type { Metadata } from "next";
import { TradeInAppraisal, Customer } from "@cellphonelt/db";
import { DataTable } from "@/components/admin/ui/DataTable";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";

export const metadata: Metadata = { title: "Thu mua máy" };
export const dynamic = "force-dynamic";

export default async function AdminTradeInsPage() {
  const tradeInDocs = await TradeInAppraisal.find({})
    .select("customerId deviceBrand deviceModel aiOfferedPrice status")
    .sort({ createdAt: 1 })
    .lean();
  const customerIds = [...new Set(tradeInDocs.map((t) => t.customerId).filter(Boolean))];
  const customerDocs = customerIds.length
    ? await Customer.find({ _id: { $in: customerIds } }).select("fullName").lean()
    : [];
  const customerNameById = new Map(customerDocs.map((c) => [c.id, c.fullName]));
  const tradeIns = tradeInDocs.map((t) => ({
    id: t.id,
    customerName: customerNameById.get(t.customerId) ?? null,
    deviceBrand: t.deviceBrand,
    deviceModel: t.deviceModel,
    aiOfferedPrice: t.aiOfferedPrice ?? null,
    status: t.status,
  }));

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
