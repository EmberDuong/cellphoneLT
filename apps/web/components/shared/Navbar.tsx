import Link from "next/link";

const navLinks = [
  { href: "/products", label: "Phụ kiện" },
  { href: "/repair", label: "Sửa chữa" },
  { href: "/trade-in", label: "Thu mua máy cũ" },
];

export function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link href="/" className="navbar-logo">
          <span className="logo-icon">📱</span>
          <span className="logo-text">
            cellphone<span className="logo-accent">LT</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="navbar-links">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="nav-link">
              {l.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="navbar-actions">
          <Link href="/repair" className="btn-outline-sm">
            Đặt lịch ngay
          </Link>
          <Link href="/trade-in" className="btn-primary-sm">
            Bán máy cũ
          </Link>
        </div>
      </div>
    </header>
  );
}
