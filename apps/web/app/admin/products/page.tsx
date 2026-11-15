import Link from "next/link";
import type { Metadata } from "next";
import { Product, Brand } from "@cellphonelt/db";
import { DataTable } from "@/components/admin/ui/DataTable";
import QuickStatusToggle from "./QuickStatusToggle";

export const metadata: Metadata = { title: "Quản lý sản phẩm" };
export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const productDocs = await Product.find({})
    .select("name sku basePrice minPrice maxPrice status brandId")
    .sort({ createdAt: 1 })
    .lean();
  const brandIds = [...new Set(productDocs.map((p) => p.brandId).filter(Boolean))];
  const brandDocs = brandIds.length
    ? await Brand.find({ _id: { $in: brandIds } }).select("name").lean()
    : [];
  const brandNameById = new Map(brandDocs.map((b) => [b.id, b.name]));
  const allProducts = productDocs.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku ?? null,
    basePrice: p.basePrice ?? null,
    minPrice: p.minPrice ?? null,
    maxPrice: p.maxPrice ?? null,
    status: p.status,
    brandName: (p.brandId && brandNameById.get(p.brandId)) || null,
  }));

  return (
    <>
      <header className="admin-topbar">
        <h1 className="admin-topbar-title">Kho hàng hóa</h1>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link href="/admin/products/import" className="btn-outline-sm">
            Import Excel
          </Link>
          <Link href="/admin/products/new" className="btn-primary-sm">
            + Thêm mới
          </Link>
        </div>
      </header>

      <main className="admin-content">
          <DataTable 
            title="Tất cả sản phẩm"
            searchPlaceholder="Tìm kiếm SP..."
            columns={["ID", "Sản phẩm", "Thương hiệu", "Giá bán", "Khoảng giá", "Trạng thái", <div style={{textAlign:"right"}}>Thao tác</div>]}
            isEmpty={allProducts.length === 0}
          >
            {allProducts.map((p) => (
              <tr key={p.id} style={p.status === "draft" ? { background: "rgba(108,71,255,0.05)" } : {}}>
                <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                  {p.id.substring(0, 8)}
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: p.status === "draft" ? "var(--primary)" : "inherit" }}>
                    {p.status === "draft" && "[Bản nháp] "}{p.name}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    SKU: {p.sku || "N/A"}
                  </div>
                </td>
                <td>{p.brandName || "Không có"}</td>
                <td style={{ fontWeight: 600 }}>
                  {Number(p.basePrice).toLocaleString('vi-VN')}đ
                </td>
                <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  {p.minPrice || p.maxPrice ? `${p.minPrice || 0}đ - ${p.maxPrice || '∞'}đ` : "-"}
                </td>
                <td>
                  <QuickStatusToggle id={p.id} initialStatus={p.status} />
                </td>
                <td style={{ textAlign: "right" }}>
                  <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                    <Link href={`/admin/products/${p.id}/edit`} className="btn-outline-sm" style={{ padding: "0.2rem 0.6rem", fontSize: "0.8rem", textDecoration: "none" }}>
                      Sửa
                    </Link>
                    <form action={async () => {
                      "use server";
                      const { deleteProductAction } = await import("./actions");
                      await deleteProductAction(p.id);
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
