import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { db, products, brands, categories, eq } from "@cellphonelt/db";
import { AddToCartButtons } from "@/components/storefront/AddToCartButtons";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.query.products.findFirst({
    where: eq(products.slug, slug),
  });

  if (!product) {
    return { title: "Không tìm thấy sản phẩm" };
  }

  const aiSpecs = product.aiSpecs as any;
  
  return {
    title: aiSpecs?.seoTitle || product.name,
    description: aiSpecs?.metaDescription || `Mua ${product.name} chính hãng tại CellphoneLT.`,
  };
}

export default async function ProductDetailsPage({ params }: Props) {
  const { slug } = await params;

  const [product] = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      price: products.basePrice,
      images: products.images,
      aiSpecs: products.aiSpecs,
      brand: brands.name,
      category: categories.name,
      status: products.status,
    })
    .from(products)
    .leftJoin(brands, eq(products.brandId, brands.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.slug, slug))
    .limit(1);

  if (!product || product.status !== "active") {
    notFound();
  }

  const aiSpecs = product.aiSpecs as {
    description?: string;
    features?: string[];
    specs?: { label: string; value: string }[];
    compatibleModels?: string[];
    colors?: string[];
  } | null;

  const mainImage = product.images?.[0];

  return (
    <main className="section-inner" style={{ padding: "3rem 1.5rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", marginBottom: "4rem" }}>
        {/* Product Images */}
        <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", padding: "2rem", display: "flex", justifyContent: "center", alignItems: "center", border: "1px solid var(--border)", minHeight: "400px", position: "relative" }}>
          {mainImage ? (
            <Image src={mainImage} alt={product.name} fill style={{ objectFit: "contain", padding: "2rem" }} />
          ) : (
            <div style={{ fontSize: "5rem" }}>📱</div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>
            {product.brand || "Phụ kiện"} • {product.category || "Khác"}
          </div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "1rem", lineHeight: 1.2 }}>
            {product.name}
          </h1>
          
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--primary)", marginBottom: "2rem" }}>
            {Number(product.price).toLocaleString("vi-VN")}đ
          </div>

          <AddToCartButtons
            productId={product.id}
            productSlug={product.slug}
            productName={product.name}
            productPrice={Number(product.price)}
            productBrand={product.brand ?? undefined}
          />

          {/* AI Specs Features */}
          {aiSpecs?.features && aiSpecs.features.length > 0 && (
            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>Đặc điểm nổi bật</h3>
              <ul style={{ listStyle: "disc", paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem", color: "var(--text-muted)" }}>
                {aiSpecs.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Details Tabs */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "3rem" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem", borderBottom: "2px solid var(--border)", paddingBottom: "0.5rem" }}>
            Mô tả sản phẩm
          </h2>
          <div style={{ color: "var(--text-muted)", lineHeight: 1.8, fontSize: "1.05rem" }}>
            {aiSpecs?.description ? (
              <p>{aiSpecs.description}</p>
            ) : (
              <p>Chưa có mô tả chi tiết cho sản phẩm này.</p>
            )}
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem", borderBottom: "2px solid var(--border)", paddingBottom: "0.5rem" }}>
            Thông số kỹ thuật
          </h2>
          {aiSpecs?.specs && aiSpecs.specs.length > 0 ? (
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
              {aiSpecs.specs.map((s, i) => (
                <div key={i} style={{ display: "flex", padding: "0.8rem 1rem", background: i % 2 === 0 ? "var(--surface)" : "transparent", borderBottom: i === aiSpecs.specs!.length - 1 ? "none" : "1px solid var(--border)" }}>
                  <div style={{ width: "40%", fontWeight: 600, color: "var(--text-muted)" }}>{s.label}</div>
                  <div style={{ width: "60%" }}>{s.value}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: "1rem", border: "1px dashed var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-muted)", textAlign: "center" }}>
              Đang cập nhật...
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
