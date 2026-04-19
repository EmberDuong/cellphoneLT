import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await params;
  // TODO: Fetch from DB using slug
  if (!p.slug) return { title: "Không tìm thấy sản phẩm" };
  
  return {
    title: `Sản phẩm ${p.slug}`, // Mock title
    description: "Chi tiết sản phẩm phụ kiện điện thoại.",
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const p = await params;
  
  // Mock Data
  const formatVND = (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
  
  return (
    <main className="section-inner" style={{ padding: "3rem 1.5rem" }}>
      {/* Breadcrumb */}
      <nav style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "2rem" }}>
        <Link href="/" className="hover:text-white">Trang chủ</Link>
        <span style={{ margin: "0 0.5rem" }}>/</span>
        <Link href="/products" className="hover:text-white">Phụ kiện</Link>
        <span style={{ margin: "0 0.5rem" }}>/</span>
        <span style={{ color: "var(--text)" }}>{p.slug}</span>
      </nav>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem" }}>
        {/* Gallery */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", aspectRatio: "1/1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "5rem" }}>
          📱
        </div>

        {/* Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <div style={{ color: "var(--primary)", fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: 1, marginBottom: "0.5rem" }}>
              Thương hiệu Apple
            </div>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text)", lineHeight: 1.2, marginBottom: "1rem" }}>
              Ốp lưng iPhone 15 Pro Max Silicon MagSafe
            </h1>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--accent)" }}>
              {formatVND(350000)}
            </div>
          </div>

          <div style={{ background: "var(--surface-2)", padding: "1.5rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem" }}>Tính năng nổi bật</h3>
            <ul style={{ listStyle: "disc", paddingLeft: "1.25rem", color: "var(--text-muted)", fontSize: "0.95rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <li>Ngoại hình sang trọng, màu sắc thanh lịch</li>
              <li>Tương thích sạc không dây MagSafe ổn định</li>
              <li>Chất liệu silicone cao cấp, chống trơn trượt</li>
              <li>Bảo vệ toàn diện cụm camera và màn hình</li>
            </ul>
          </div>

          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <button className="btn-primary" style={{ flex: 1, fontSize: "1.1rem", padding: "1rem" }}>
              Mua ngay
            </button>
            <button className="btn-outline" style={{ width: "3.5rem", padding: 0 }}>
              ❤️
            </button>
          </div>

          <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>
              <span style={{ fontSize: "1.5rem" }}>🛡️</span>
              <div>
                <strong style={{ display: "block", color: "var(--text)" }}>Bảo hành 12 tháng</strong>
                Lỗi 1 đổi 1 tại cửa hàng
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>
              <span style={{ fontSize: "1.5rem" }}>🚚</span>
              <div>
                <strong style={{ display: "block", color: "var(--text)" }}>Giao hàng siêu tốc</strong>
                Nhận hàng trong 2h tại nội thành
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
