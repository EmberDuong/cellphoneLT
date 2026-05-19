"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Wrench, RefreshCw, Package } from "lucide-react";

const services = [
  {
    Icon: Wrench,
    title: "Sửa chữa chuyên nghiệp",
    desc: "Đặt lịch sửa điện thoại online, nhận thông báo tiến độ qua Zalo.",
    href: "/repair",
    cta: "Đặt lịch ngay",
    color: "#6c47ff",
    features: ["Bảo hành 90 ngày", "Trả máy trong 2–4h", "Linh kiện chính hãng"],
  },
  {
    Icon: RefreshCw,
    title: "Thu mua máy cũ",
    desc: "Nhận báo giá tức thì cho iPhone, Samsung, OPPO... không cần chờ đợi.",
    href: "/trade-in",
    cta: "Nhận báo giá",
    color: "#ff6b35",
    features: ["Báo giá tức thì", "Thanh toán ngay", "iPhone & Android"],
  },
  {
    Icon: Package,
    title: "Phụ kiện chính hãng",
    desc: "Ốp lưng, sạc, tai nghe, cường lực — đủ loại, đa dạng mẫu mã.",
    href: "/products",
    cta: "Xem sản phẩm",
    color: "#22c55e",
    features: ["Hàng chính hãng", "Giao hàng nhanh", "Đổi trả 7 ngày"],
  },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export function ServiceCards() {
  return (
    <section 
      className="services-section" 
      style={{
        backgroundImage: "linear-gradient(rgba(13,17,23,0.95), rgba(13,17,23,0.95)), url('/images/services-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "5rem 0"
      }}
    >
      <div className="section-inner">
        <h2 className="section-title">Dịch vụ nổi bật</h2>
        <p className="section-sub">Mọi nhu cầu công nghệ — một điểm đến</p>
        <motion.div
          className="services-grid"
          variants={containerVariants as any}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {services.map((s) => (
            <motion.div
              key={s.title}
              variants={cardVariants as any}
              className="service-card"
              style={{ "--card-accent": s.color } as React.CSSProperties}
            >
              {/* Icon */}
              <div className="service-icon-wrap">
                <s.Icon size={24} />
              </div>

              <h3 className="service-title">{s.title}</h3>
              <p className="service-desc">{s.desc}</p>

              {/* Feature bullets */}
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.3rem", marginTop: "0.25rem" }}>
                {s.features.map((f) => (
                  <li key={f} style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span style={{ color: s.color, fontWeight: 700 }}>✓</span> {f}
                  </li>
                ))}
              </ul>

              <Link href={s.href} className="service-cta" style={{ color: s.color }}>
                {s.cta} →
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
