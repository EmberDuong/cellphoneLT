import Link from "next/link";
import { Smartphone, Phone, Clock, Facebook, MessageCircle } from "lucide-react";

const footerLinks = [
  {
    heading: "Dịch vụ",
    links: [
      { href: "/products",       label: "Phụ kiện điện thoại" },
      { href: "/repair",         label: "Sửa chữa điện thoại" },
      { href: "/trade-in",       label: "Thu mua máy cũ" },
    ],
  },
  {
    heading: "Hỗ trợ",
    links: [
      { href: "/repair/track",   label: "Tra cứu đơn sửa chữa" },
      { href: "#zalo",           label: "Chat Zalo ngay" },
      { href: "/account/orders", label: "Theo dõi đơn hàng" },
    ],
  },
  {
    heading: "Công ty",
    links: [
      { href: "/about",   label: "Về chúng tôi" },
      { href: "/contact", label: "Liên hệ" },
    ],
  },
];

const socials = [
  { href: "https://facebook.com", Icon: Facebook, label: "Facebook" },
  { href: "https://zalo.me",      Icon: MessageCircle, label: "Zalo" },
];

export function Footer() {
  return (
    <footer className="footer">
      {/* Gradient top border */}
      <div style={{ height: 2, background: "linear-gradient(90deg, var(--primary), var(--accent))" }} />

      <div className="footer-inner">
        {/* Brand column */}
        <div className="footer-brand">
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <Smartphone size={20} style={{ color: "var(--primary)" }} />
            <span className="logo-text" style={{ fontSize: "1.4rem" }}>
              cellphone<span className="logo-accent">LT</span>
            </span>
          </Link>
          <p className="footer-tagline" style={{ marginTop: "0.5rem" }}>
            Phụ kiện chính hãng · Sửa chữa uy tín · Thu mua giá tốt
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "1rem" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
              <Clock size={13} /> 8:00 – 20:00 hàng ngày
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
              <Phone size={13} /> 0900 000 000
            </span>
          </div>

          {/* Social icons */}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
            {socials.map(({ href, Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="footer-social-icon"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {footerLinks.map((col) => (
          <div key={col.heading} className="footer-col">
            <h4 className="footer-col-heading">{col.heading}</h4>
            <ul className="footer-col-links">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="footer-link">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} CellphoneLT. All rights reserved.</span>
        <span style={{ opacity: 0.5, fontSize: "0.78rem" }}>Made with ♥ in Việt Nam</span>
      </div>
    </footer>
  );
}
