import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/storefront/ProductCard";
import { db, products, brands, categories, eq, desc, and } from "@cellphonelt/db";

export const metadata: Metadata = {
  title: "Sản phẩm",
  description: "Trang bị cho dế yêu với ốp lưng, kính cường lực, cáp sạc và sạc dự phòng chính hãng.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const brandFilter = params.brand as string | undefined;
  const categoryFilter = params.category as string | undefined;

  // 1. Fetch categories & brands for sidebar
  const allCategories = await db.select().from(categories).orderBy(categories.sortOrder);
  const allBrands = await db.select().from(brands).orderBy(brands.name);

  // 2. Build where clause
  const conditions = [eq(products.status, "active")];
  
  if (brandFilter) {
    const b = allBrands.find((br) => br.slug === brandFilter);
    if (b) conditions.push(eq(products.brandId, b.id));
  }
  
  if (categoryFilter) {
    const c = allCategories.find((cat) => cat.slug === categoryFilter);
    if (c) conditions.push(eq(products.categoryId, c.id));
  }

  // 3. Fetch products
  const productList = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      price: products.basePrice,
      brand: brands.name,
    })
    .from(products)
    .leftJoin(brands, eq(products.brandId, brands.id))
    .where(and(...conditions))
    .orderBy(desc(products.createdAt));

  return (
    <main className="section-inner" style={{ padding: "3rem 1.5rem" }}>
      <header style={{ marginBottom: "2rem" }}>
        <h1 className="section-title" style={{ fontSize: "2rem" }}>Phụ kiện điện thoại</h1>
        <p className="section-sub">Phân phối chính hãng Apple, Anker, Ugreen, Spigen...</p>
      </header>

      <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
        {/* Sidebar Filters */}
        <aside style={{ width: "220px", flexShrink: 0, paddingRight: "1rem", borderRight: "1px solid var(--border)" }}>
          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "1rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Danh mục</h3>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.95rem" }}>
              <li>
                <Link href={`/products${brandFilter ? `?brand=${brandFilter}` : ''}`} style={{ color: !categoryFilter ? "var(--primary)" : "inherit", fontWeight: !categoryFilter ? 600 : 400 }}>
                  Tất cả sản phẩm
                </Link>
              </li>
              {allCategories.map((c) => (
                <li key={c.id}>
                  <Link href={`/products?category=${c.slug}${brandFilter ? `&brand=${brandFilter}` : ''}`} style={{ color: categoryFilter === c.slug ? "var(--primary)" : "inherit", fontWeight: categoryFilter === c.slug ? 600 : 400 }}>
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "1rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Thương hiệu</h3>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.95rem" }}>
              <li>
                <Link href={`/products${categoryFilter ? `?category=${categoryFilter}` : ''}`} style={{ color: !brandFilter ? "var(--primary)" : "inherit", fontWeight: !brandFilter ? 600 : 400 }}>
                  Tất cả thương hiệu
                </Link>
              </li>
              {allBrands.map((b) => (
                <li key={b.id}>
                  <Link href={`/products?brand=${b.slug}${categoryFilter ? `&category=${categoryFilter}` : ''}`} style={{ color: brandFilter === b.slug ? "var(--primary)" : "inherit", fontWeight: brandFilter === b.slug ? 600 : 400 }}>
                    {b.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Product Grid */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem", alignItems: "center" }}>
            <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Hiển thị {productList.length} sản phẩm</span>
            <select style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", padding: "0.4rem 0.8rem", borderRadius: "var(--radius-sm)", fontSize: "0.9rem" }}>
              <option>Mới nhất</option>
              <option>Giá tăng dần</option>
              <option>Giá giảm dần</option>
            </select>
          </div>
          
          {productList.length > 0 ? (
            <div className="product-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", marginTop: 0 }}>
              {productList.map((p) => (
                <ProductCard 
                  key={p.id} 
                  id={p.id}
                  name={p.name}
                  slug={p.slug}
                  price={Number(p.price) || 0}
                  brand={p.brand || undefined}
                />
              ))}
            </div>
          ) : (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)", border: "1px dashed var(--border)", borderRadius: "var(--radius)" }}>
              Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
