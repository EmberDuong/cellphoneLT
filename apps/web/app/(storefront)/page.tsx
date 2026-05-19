import type { Metadata } from "next";
import Link from "next/link";
import { ServiceCards } from "@/components/storefront/ServiceCards";
import { ProductCard } from "@/components/storefront/ProductCard";
import { ScrollReveal } from "@/components/storefront/ScrollReveal";
import { InfiniteMarquee } from "@/components/storefront/InfiniteMarquee";
import { FloatingElement } from "@/components/storefront/FloatingElement";
import Image from "next/image";
import {
  ShieldCheck,
  Zap,
  Banknote,
  MessageCircle,
  ShoppingBag,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "CellphoneLT — Phụ kiện, sửa chữa & thu mua điện thoại",
  description:
    "Mua phụ kiện điện thoại chính hãng, đặt lịch sửa chữa và nhận báo giá thu mua máy cũ ngay lập tức.",
};
export const dynamic = "force-dynamic";

import { db, products, brands, eq, desc } from "@cellphonelt/db";

const trustItems = [
  {
    Icon: ShieldCheck,
    title: "Bảo hành chính hãng",
    desc: "Linh kiện chính hãng, bảo hành 90 ngày",
  },
  {
    Icon: Zap,
    title: "Sửa nhanh trong ngày",
    desc: "Cam kết trả máy trong 2–4 giờ",
  },
  {
    Icon: Banknote,
    title: "Thu mua giá cao",
    desc: "Báo giá tức thì, thanh toán ngay",
  },
  {
    Icon: MessageCircle,
    title: "Hỗ trợ qua Zalo",
    desc: "Cập nhật tiến độ 24/7 qua Zalo OA",
  },
];

const brands_marquee = [
  "Apple", "Samsung", "Xiaomi", "Oppo", "Vivo",
  "Asus", "Realme", "Google Pixel", "OnePlus", "Sony",
];

export default async function HomePage() {
  const featuredProducts = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      price: products.basePrice,
      brand: brands.name,
    })
    .from(products)
    .leftJoin(brands, eq(products.brandId, brands.id))
    .where(eq(products.status, "active"))
    .orderBy(desc(products.createdAt))
    .limit(4);

  return (
    <>
      {/* ── HERO ───────────────────────────────── */}
      <section
        className="hero"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "3rem",
          textAlign: "left",
          padding: "7rem 1.5rem 6rem",
          position: "relative",
          backgroundImage: "linear-gradient(to right, rgba(13,17,23,0.9) 0%, rgba(13,17,23,0.6) 100%), url('/images/hero-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Left: copy */}
        <div className="hero-inner" style={{ flex: 1, margin: 0, zIndex: 2 }}>
          <ScrollReveal yOffset={30}>
            <div className="hero-badge" style={{ marginBottom: "1.5rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              <Sparkles size={13} />
              Nền tảng công nghệ tương lai
            </div>

            <h1 className="hero-title" style={{ fontSize: "3.5rem", lineHeight: 1.1 }}>
              Phụ kiện xịn.<br />
              <span className="highlight">Sửa chữa uy tín.</span><br />
              Thu mua <span style={{ color: "var(--accent)" }}>giá tốt nhất.</span>
            </h1>

            <p className="hero-sub" style={{ margin: "1.5rem 0", fontSize: "1.1rem", maxWidth: "500px" }}>
              Một nơi duy nhất cho mọi nhu cầu công nghệ của bạn — từ ốp lưng, cáp sạc cho đến sửa chữa chuyên sâu và thu mua máy cũ.
            </p>

            <div className="hero-actions" style={{ justifyContent: "flex-start" }}>
              <Link href="/products" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                <ShoppingBag size={18} /> Mua sắm ngay
              </Link>
              <Link href="/trade-in" className="btn-outline" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                <Banknote size={18} /> Bán máy cũ
              </Link>
            </div>

            {/* Stats row */}
            <div className="hero-stats">
              {[
                { value: "500+", label: "Sản phẩm" },
                { value: "4.9★", label: "Đánh giá" },
                { value: "2 giờ", label: "Sửa nhanh" },
              ].map((s) => (
                <div className="stat-item" key={s.label}>
                  <span className="stat-value gradient-text">{s.value}</span>
                  <span className="stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>

        {/* Right: floating phone */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center", zIndex: 2 }}>
          <ScrollReveal delay={0.2}>
            <FloatingElement duration={4} yOffset={20}>
              <div style={{ position: "relative", width: "380px", height: "480px" }}>
                <Image
                  src="/images/floating-phone.png"
                  alt="Floating Neon Phone"
                  fill
                  style={{
                    objectFit: "contain",
                    filter: "drop-shadow(0 20px 60px rgba(183,148,244,0.5))",
                  }}
                  priority
                />
              </div>
            </FloatingElement>
          </ScrollReveal>
        </div>
      </section>

      {/* ── INFINITE MARQUEE ────────────────────── */}
      <section
        style={{
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          padding: "1.5rem 0",
          background: "rgba(0,0,0,0.2)",
          overflow: "hidden",
        }}
      >
        <InfiniteMarquee speed={30}>
          {brands_marquee.map((brand, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "3rem",
                marginRight: "3rem",
                color: "var(--text-muted)",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "1.1rem",
                textTransform: "uppercase",
                letterSpacing: "2px",
                opacity: 0.55,
              }}
            >
              {brand}
              <span style={{ color: "var(--primary)", fontSize: "0.5rem" }}>◆</span>
            </div>
          ))}
        </InfiniteMarquee>
      </section>

      {/* ── TRUST BADGES ──────────────────────── */}
      <ScrollReveal>
        <section className="trust-section">
          <div className="section-inner">
            <div className="trust-grid">
              {trustItems.map((t) => (
                <div className="trust-item" key={t.title}>
                  <div className="trust-icon-wrap">
                    <t.Icon size={22} />
                  </div>
                  <span className="trust-title">{t.title}</span>
                  <span className="trust-desc">{t.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ── SERVICES ─────────────────────────── */}
      <ServiceCards />

      {/* ── FEATURED PRODUCTS ─────────────────── */}
      <ScrollReveal>
        <section className="product-grid-section">
          <div className="section-inner">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.5rem" }}>
              <div>
                <h2 className="section-title">Sản phẩm nổi bật</h2>
                <p className="section-sub">Phụ kiện phổ biến nhất tuần này</p>
              </div>
              <Link href="/products" className="btn-outline-sm" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                Xem tất cả <ArrowRight size={14} />
              </Link>
            </div>

            <div className="product-grid">
              {featuredProducts.map((p, i) => (
                <ScrollReveal key={p.id} delay={i * 0.1} width="100%">
                  <ProductCard
                    id={p.id}
                    name={p.name}
                    slug={p.slug}
                    price={Number(p.price) || 0}
                    brand={p.brand || undefined}
                    isNew={true}
                  />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ── CTA BANNER ───────────────────────── */}
      <ScrollReveal>
        <section style={{ 
          padding: "5rem 1.5rem", 
          textAlign: "center",
          backgroundImage: "linear-gradient(rgba(13,17,23,0.85), rgba(13,17,23,0.85)), url('/images/cta-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}>
          <div
            style={{
              maxWidth: 700,
              margin: "0 auto",
              background: "linear-gradient(135deg, rgba(183,148,244,0.12), rgba(11,197,234,0.08))",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(183,148,244,0.25)",
              borderRadius: 24,
              padding: "4rem 2rem",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3), 0 0 40px rgba(183,148,244,0.06)",
            }}
          >
            <h2 style={{ fontSize: "2.2rem", fontWeight: 800, marginBottom: "1rem" }}>
              Muốn bán máy cũ?{" "}
              <span style={{ color: "var(--accent)" }}>Nhận giá ngay!</span>
            </h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "2.5rem", fontSize: "1.05rem", lineHeight: 1.6 }}>
              Trả lời vài câu hỏi về tình trạng máy. Hệ thống AI sẽ tự động tính giá thu mua tốt nhất cho bạn — không cần đợi nhân viên phản hồi.
            </p>
            <Link
              href="/trade-in"
              className="btn-primary"
              style={{ padding: "1rem 3rem", fontSize: "1.1rem", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
            >
              <Banknote size={20} /> Bắt đầu định giá miễn phí
            </Link>
          </div>
        </section>
      </ScrollReveal>
    </>
  );
}
