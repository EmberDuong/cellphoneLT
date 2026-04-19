import Link from "next/link";

const services = [
  {
    icon: "🔧",
    title: "Sửa chữa chuyên nghiệp",
    desc: "Đặt lịch sửa điện thoại online, nhận thông báo tiến độ qua Zalo.",
    href: "/repair",
    cta: "Đặt lịch ngay",
    color: "#6c47ff",
  },
  {
    icon: "♻️",
    title: "Thu mua máy cũ",
    desc: "Nhận báo giá tức thì cho iPhone, Samsung, OPPO... không cần chờ đợi.",
    href: "/trade-in",
    cta: "Nhận báo giá",
    color: "#ff6b35",
  },
  {
    icon: "📦",
    title: "Phụ kiện chính hãng",
    desc: "Ốp lưng, sạc, tai nghe, cường lực — đủ loại, đa dạng mẫu mã.",
    href: "/products",
    cta: "Xem sản phẩm",
    color: "#22c55e",
  },
];

export function ServiceCards() {
  return (
    <section className="services-section">
      <div className="section-inner">
        <h2 className="section-title">Dịch vụ nổi bật</h2>
        <div className="services-grid">
          {services.map((s) => (
            <div
              key={s.title}
              className="service-card"
              style={{ "--card-accent": s.color } as React.CSSProperties}
            >
              <div className="service-icon">{s.icon}</div>
              <h3 className="service-title">{s.title}</h3>
              <p className="service-desc">{s.desc}</p>
              <Link href={s.href} className="service-cta">
                {s.cta} →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
