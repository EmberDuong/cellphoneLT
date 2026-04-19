import type { Metadata } from "next";
import { ProductCard } from "@/components/storefront/ProductCard";

export const metadata: Metadata = {
  title: "Sản phẩm",
  description: "Trang bị cho dế yêu với ốp lưng, kính cường lực, cáp sạc và sạc dự phòng chính hãng.",
};

const mockProducts = [
  { id: "1", name: "Ốp lưng iPhone 15 Pro Max - MagSafe Silicone", slug: "op-lung-iphone-15-pro-max-magsafe", price: 350000, brand: "Apple", isNew: true },
  { id: "2", name: "Cáp sạc USB-C to Lightning 1.2m Anker PowerLine", slug: "cap-sac-anker-powerline", price: 290000, brand: "Anker", isNew: false },
  { id: "3", name: "Pin dự phòng Xiaomi 33W Fast Charge 20000mAh", slug: "pin-du-phong-xiaomi-33w", price: 780000, brand: "Xiaomi", isNew: true },
  { id: "4", name: "Kính cường lực Samsung Galaxy S25 Ultra Full Glue", slug: "cuong-luc-samsung-s25-ultra", price: 150000, brand: "Samsung", isNew: false },
  { id: "5", name: "Sạc nhanh UGREEN Nexode 65W GaN Type-C", slug: "sac-nhanh-ugreen-nexode-65w", price: 650000, brand: "Ugreen", isNew: false },
  { id: "6", name: "Tai nghe Bluetooth Sony WF-1000XM5 Xanh", slug: "tai-nghe-sony-wf-1000xm5", price: 5990000, brand: "Sony", isNew: false },
  { id: "7", name: "Ốp UAG Pathfinder trong suốt S24 Ultra", slug: "op-uag-s24-ultra", price: 850000, brand: "UAG", isNew: true },
  { id: "8", name: "Sạc dự phòng Magsafe Baseus 10000mAh", slug: "pin-magsafe-baseus", price: 450000, brand: "Baseus", isNew: false },
];

export default function ProductsPage() {
  return (
    <main className="section-inner" style={{ padding: "3rem 1.5rem" }}>
      <header style={{ marginBottom: "2rem" }}>
        <h1 className="section-title" style={{ fontSize: "2rem" }}>Phụ kiện điện thoại</h1>
        <p className="section-sub">Phân phối chính hãng Apple, Anker, Ugreen, Spigen...</p>
      </header>

      <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
        {/* Sidebar Filters (Mock) */}
        <aside style={{ width: "220px", flexShrink: 0, paddingRight: "1rem", borderRight: "1px solid var(--border)" }}>
          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "1rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Danh mục</h3>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.95rem" }}>
              <li style={{ color: "var(--primary)", fontWeight: 600 }}>Tất cả sản phẩm</li>
              <li>Ốp lưng - Bao da</li>
              <li>Cáp - Sạc</li>
              <li>Pin dự phòng</li>
              <li>Miếng dán màn hình</li>
              <li>Thiết bị âm thanh</li>
            </ul>
          </div>

          <div>
            <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "1rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Thương hiệu</h3>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.95rem" }}>
              <li>Apple</li>
              <li>Samsung</li>
              <li>Anker</li>
              <li>Ugreen</li>
              <li>Spigen</li>
              <li>Baseus</li>
            </ul>
          </div>
        </aside>

        {/* Product Grid */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem", alignItems: "center" }}>
            <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Hiển thị {mockProducts.length} sản phẩm</span>
            <select style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", padding: "0.4rem 0.8rem", borderRadius: "var(--radius-sm)", fontSize: "0.9rem" }}>
              <option>Mới nhất</option>
              <option>Giá tăng dần</option>
              <option>Giá giảm dần</option>
              <option>Bán chạy nhất</option>
            </select>
          </div>
          
          <div className="product-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", marginTop: 0 }}>
            {mockProducts.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
