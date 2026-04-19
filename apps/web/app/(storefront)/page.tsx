import type { Metadata } from "next";
import Link from "next/link";
import { ServiceCards } from "@/components/storefront/ServiceCards";
import { ProductCard } from "@/components/storefront/ProductCard";

export const metadata: Metadata = {
  title: "CellphoneLT — Phụ kiện, sửa chữa & thu mua điện thoại",
  description:
    "Mua phụ kiện điện thoại chính hãng, đặt lịch sửa chữa và nhận báo giá thu mua máy cũ ngay lập tức.",
};

// Mock data — will be replaced with DB query in Phase 1 completion
const featuredProducts = [
  { id: "1", name: "Ốp lưng iPhone 15 Pro Max - MagSafe Silicone", slug: "op-lung-iphone-15-pro-max-magsafe", price: 350000, brand: "Apple", isNew: true },
  { id: "2", name: "Cáp sạc USB-C to Lightning 1.2m Anker PowerLine", slug: "cap-sac-anker-powerline", price: 290000, brand: "Anker", isNew: false },
  { id: "3", name: "Pin dự phòng Xiaomi 33W Fast Charge 20000mAh", slug: "pin-du-phong-xiaomi-33w", price: 780000, brand: "Xiaomi", isNew: true },
  { id: "4", name: "Kính cường lực Samsung Galaxy S25 Ultra Full Glue", slug: "cuong-luc-samsung-s25-ultra", price: 150000, brand: "Samsung", isNew: false },
];

const trustItems = [
  { icon: "🛡️", title: "Bảo hành chính hãng", desc: "Linh kiện chính hãng, bảo hành 90 ngày" },
  { icon: "⚡", title: "Sửa nhanh trong ngày", desc: "Cam kết trả máy trong 2–4 giờ" },
  { icon: "📱", title: "Thu mua giá cao", desc: "Báo giá tức thì, thanh toán ngay" },
  { icon: "💬", title: "Hỗ trợ qua Zalo", desc: "Cập nhật tiến độ 24/7 qua Zalo OA" },
];

export default function HomePage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────── */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-badge">
            ✨ Nền tảng quản lý điện thoại thông minh
          </div>

          <h1 className="hero-title">
            Phụ kiện xịn.
            <br />
            <span className="highlight">Sửa chữa uy tín.</span>
            <br />
            Thu mua <span className="accent">giá tốt nhất.</span>
          </h1>

          <p className="hero-sub">
            Một nơi duy nhất cho mọi nhu cầu điện thoại của bạn — từ ốp lưng, cáp sạc
            cho đến sửa chữa chuyên sâu và thu mua máy cũ với giá hấp dẫn.
          </p>

          <div className="hero-actions">
            <Link href="/products" className="btn-primary">
              🛍️ Mua phụ kiện ngay
            </Link>
            <Link href="/trade-in" className="btn-outline">
              💰 Bán máy cũ giá tốt
            </Link>
          </div>

          <div className="hero-stats">
            {[
              { value: "500+", label: "Sản phẩm đang bán" },
              { value: "2,000+", label: "Khách hàng tin tưởng" },
              { value: "98%", label: "Hài lòng sau sửa chữa" },
              { value: "30 phút", label: "Thời gian phản hồi trung bình" },
            ].map((s) => (
              <div className="stat-item" key={s.label}>
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST BADGES ─────────────────────── */}
      <section className="trust-section">
        <div className="section-inner">
          <div className="trust-grid">
            {trustItems.map((t) => (
              <div className="trust-item" key={t.title}>
                <span className="trust-icon">{t.icon}</span>
                <span className="trust-title">{t.title}</span>
                <span className="trust-desc">{t.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ─────────────────────────── */}
      <ServiceCards />

      {/* ── FEATURED PRODUCTS ────────────────── */}
      <section className="product-grid-section">
        <div className="section-inner">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.5rem" }}>
            <div>
              <h2 className="section-title">Sản phẩm nổi bật</h2>
              <p className="section-sub">Phụ kiện phổ biến nhất tuần này</p>
            </div>
            <Link href="/products" className="btn-outline-sm">
              Xem tất cả →
            </Link>
          </div>

          <div className="product-grid">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────── */}
      <section style={{ padding: "5rem 1.5rem", textAlign: "center" }}>
        <div
          style={{
            maxWidth: 700,
            margin: "0 auto",
            background: "linear-gradient(135deg, rgba(108,71,255,0.12), rgba(255,107,53,0.08))",
            border: "1px solid rgba(108,71,255,0.25)",
            borderRadius: 24,
            padding: "3rem 2rem",
          }}
        >
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "0.75rem" }}>
            Muốn bán máy cũ? <span style={{ color: "var(--accent)" }}>Nhận giá ngay!</span>
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.75rem", fontSize: "0.95rem" }}>
            Trả lời vài câu hỏi về tình trạng máy. Hệ thống AI sẽ tự động tính giá thu mua
            tốt nhất cho bạn — không cần đợi nhân viên phản hồi.
          </p>
          <Link href="/trade-in" className="btn-primary">
            💰 Bắt đầu định giá miễn phí
          </Link>
        </div>
      </section>
    </>
  );
}
