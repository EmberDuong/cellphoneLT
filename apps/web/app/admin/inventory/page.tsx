import Link from "next/link";
import type { Metadata } from "next";
import { InventoryItem, Product } from "@cellphonelt/db";
import { DataTable } from "@/components/admin/ui/DataTable";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";

export const metadata: Metadata = { title: "Kho IMEI" };
export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const itemDocs = await InventoryItem.find({})
    .select("productId imeiSerial quantity conditionGrade stockStatus")
    .sort({ createdAt: 1 })
    .lean();
  const productIds = [...new Set(itemDocs.map((i) => i.productId).filter(Boolean))];
  const productDocs = productIds.length
    ? await Product.find({ _id: { $in: productIds } }).select("name").lean()
    : [];
  const productNameById = new Map(productDocs.map((p) => [p.id, p.name]));
  const items = itemDocs.map((i) => ({
    id: i.id,
    productName: productNameById.get(i.productId) ?? null,
    imeiSerial: i.imeiSerial ?? null,
    quantity: i.quantity,
    conditionGrade: i.conditionGrade,
    stockStatus: i.stockStatus,
  }));

  return (
    <>
      <header className="admin-topbar">
        <h1 className="admin-topbar-title">Kho IMEI & Tồn kho</h1>
        <Link href="/admin/inventory/new" className="btn-primary-sm">
          + Nhập kho
        </Link>
      </header>

      <main className="admin-content">
        <DataTable
          title="Danh sách tồn kho"
          columns={["ID", "Sản phẩm", "IMEI / Serial", "Số lượng", "Tình trạng", "Trạng thái", <div style={{textAlign:"right"}}>Thao tác</div>]}
          isEmpty={items.length === 0}
        >
          {items.map((item) => (
            <tr key={item.id}>
              <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                {item.id.substring(0, 8)}
              </td>
              <td style={{ fontWeight: 600 }}>{item.productName}</td>
              <td>{item.imeiSerial || "N/A"}</td>
              <td>{item.quantity}</td>
              <td>{item.conditionGrade}</td>
              <td>
                <StatusBadge status={item.stockStatus} variant={item.stockStatus === 'available' ? 'active' : 'draft'} />
              </td>
              <td style={{ textAlign: "right" }}>
                <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                  <Link
                    href={`/admin/inventory/${item.id}`}
                    className="btn-outline-sm"
                    style={{ padding: "0.2rem 0.6rem", fontSize: "0.8rem", textDecoration: "none" }}
                  >
                    Sửa
                  </Link>
                   <form action={async () => {
                        "use server";
                        const { deleteInventoryAction } = await import("./actions");
                        await deleteInventoryAction(item.id);
                      }}>
                        <button type="submit" className="btn-outline-sm" style={{ padding: "0.2rem 0.6rem", fontSize: "0.8rem", borderColor: "var(--danger)", color: "var(--danger)" }}>
                          Xóa
                        </button>
                    </form>
                </div>
              </td>

            </tr>
          ))}
        </DataTable>
      </main>
    </>
  );
}
