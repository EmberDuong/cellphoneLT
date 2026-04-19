import Link from "next/link";

const footerLinks = [
  {
    heading: "Dịch vụ",
    links: [
      { href: "/products", label: "Phụ kiện điện thoại" },
      { href: "/repair", label: "Sửa chữa điện thoại" },
      { href: "/trade-in", label: "Thu mua máy cũ" },
    ],
  },
  {
    heading: "Hỗ trợ",
    links: [
      { href: "/repair/track", label: "Tra cứu đơn sửa chữa" },
      { href: "#zalo", label: "Chat Zalo ngay" },
    ],
  },
  {
    heading: "Công ty",
    links: [
      { href: "/about", label: "Về chúng tôi" },
      { href: "/contact", label: "Liên hệ" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* Brand */}
        <div className="footer-brand">
          <span className="logo-text" style={{ fontSize: "1.4rem" }}>
            cellphone<span className="logo-accent">LT</span>
          </span>
          <p className="footer-tagline">
            Phụ kiện chính hãng · Sửa chữa uy tín · Thu mua giá tốt
          </p>
          <p className="footer-tagline" style={{ marginTop: 4 }}>
            🕐 Mở cửa: 8:00 – 20:00 hàng ngày
          </p>
        </div>

        {/* Link columns */}
        {footerLinks.map((col) => (
          <div key={col.heading} className="footer-col">
            <h4 className="footer-col-heading">{col.heading}</h4>
            <ul className="footer-col-links">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="footer-link">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} CellphoneLT. All rights reserved.</span>
      </div>
    </footer>
  );
}
