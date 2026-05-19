"use client";

import { useState, useTransition } from "react";
import * as XLSX from "xlsx";
import Link from "next/link";
import { DataTable } from "@/components/admin/ui/DataTable";
import { importProductsAction } from "./actions";

export default function ImportProductsClient({ brands, categories }: { brands: any[], categories: any[] }) {
  const [data, setData] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(null);
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData = XLSX.utils.sheet_to_json(ws);
        
        // Map Excel headers to expected keys (name, sku, brandName, categoryName, basePrice, minPrice, maxPrice, status)
        const mappedData = rawData.map((row: any) => ({
          name: row["Tên sản phẩm"] || row["Name"],
          sku: row["SKU"],
          brandName: row["Thương hiệu"] || row["Brand"],
          categoryName: row["Danh mục"] || row["Category"],
          basePrice: row["Giá bán"] || row["Price"] || 0,
          minPrice: row["Giá tối thiểu"] || row["Min Price"] || null,
          maxPrice: row["Giá tối đa"] || row["Max Price"] || null,
          status: row["Trạng thái"] || row["Status"] || "draft"
        })).filter((row) => row.name); // only keep rows with a name
        
        setData(mappedData);
      } catch (err) {
        console.error(err);
        setError("Lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = () => {
    if (data.length === 0) return;
    
    startTransition(async () => {
      setError(null);
      
      // Need to resolve brand and category names to IDs
      const payload = data.map(row => {
        const brand = brands.find(b => b.name.toLowerCase() === row.brandName?.toLowerCase());
        const category = categories.find(c => c.name.toLowerCase() === row.categoryName?.toLowerCase());
        
        return {
          name: row.name,
          sku: row.sku?.toString(),
          brandId: brand?.id,
          categoryId: category?.id,
          basePrice: row.basePrice?.toString(),
          minPrice: row.minPrice?.toString(),
          maxPrice: row.maxPrice?.toString(),
          status: row.status === "active" ? "active" : "draft",
          // Generate slug from name if not provided
          slug: row.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 6)
        };
      });

      const res = await importProductsAction(payload);
      
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(`Đã import thành công ${res.count} sản phẩm.`);
        setData([]); // clear data
      }
    });
  };

  return (
    <>
      <header className="admin-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/admin/products" style={{ color: "var(--text-muted)" }}>← Trở về</Link>
          <h1 className="admin-topbar-title">Nhập sản phẩm từ Excel</h1>
        </div>
      </header>

      <main className="admin-content" style={{ maxWidth: 1000, margin: "0 auto" }}>
        
        <div className="card" style={{ padding: "1.5rem", background: "var(--card-bg, #fff)", borderRadius: "8px", border: "1px solid var(--border-color, #eaeaea)", marginBottom: "1.5rem" }}>
          <p style={{ marginBottom: "1rem", color: "var(--text-muted)" }}>
            Tải lên file Excel (.xlsx hoặc .xls). File cần có các cột: <strong>Tên sản phẩm, SKU, Thương hiệu, Danh mục, Giá bán, Giá tối thiểu, Giá tối đa, Trạng thái</strong>.
          </p>
          <input 
            type="file" 
            accept=".xlsx, .xls, .csv" 
            onChange={handleFileUpload}
            className="form-input"
            style={{ width: "100%", maxWidth: 400 }}
          />

          {error && <div style={{ marginTop: "1rem", padding: "0.75rem", background: "#fee2e2", color: "#b91c1c", borderRadius: "0.375rem" }}>{error}</div>}
          {success && <div style={{ marginTop: "1rem", padding: "0.75rem", background: "#dcfce7", color: "#15803d", borderRadius: "0.375rem" }}>{success}</div>}
        </div>

        {data.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Xem trước dữ liệu ({data.length} dòng)</h2>
              <button 
                className="btn-primary" 
                onClick={handleImport} 
                disabled={isPending}
              >
                {isPending ? "Đang xử lý..." : "Xác nhận Nhập dữ liệu"}
              </button>
            </div>
            
            <DataTable
              columns={["Tên sản phẩm", "SKU", "Thương hiệu", "Danh mục", "Giá bán", "Khoảng giá"]}
            >
              {data.map((row, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{row.name}</td>
                  <td>{row.sku || "-"}</td>
                  <td>{row.brandName || "-"}</td>
                  <td>{row.categoryName || "-"}</td>
                  <td>{row.basePrice}đ</td>
                  <td>
                    {row.minPrice || row.maxPrice ? `${row.minPrice || 0}đ - ${row.maxPrice || '∞'}đ` : "-"}
                  </td>
                </tr>
              ))}
            </DataTable>
          </div>
        )}
      </main>
    </>
  );
}
