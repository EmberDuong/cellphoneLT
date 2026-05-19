"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/components/storefront/CartProvider";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone,
  ShoppingCart,
  Menu,
  X,
  Wrench,
  RefreshCw,
  Package,
  User,
  ShoppingBag,
  LogOut,
  ChevronRight,
  CalendarCheck,
} from "lucide-react";

const navLinks = [
  { href: "/products", label: "Phụ kiện", icon: Package },
  { href: "/repair",   label: "Sửa chữa", icon: Wrench },
  { href: "/trade-in", label: "Thu mua máy cũ", icon: RefreshCw },
];

export function Navbar() {
  const { data: session } = useSession();
  const { totalItems } = useCart();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const pathname = usePathname();

  const isCustomer = (session?.user as any)?.role === "customer";

  return (
    <>
      <header className="navbar">
        <div className="navbar-inner">
          {/* Logo */}
          <Link href="/" className="navbar-logo">
            <Smartphone size={20} className="logo-icon" style={{ color: "var(--primary)" }} />
            <span className="logo-text">
              cellphone<span className="logo-accent">LT</span>
            </span>
          </Link>

          {/* Desktop Nav links */}
          <nav className="navbar-links">
            {navLinks.map((l) => {
              const active = pathname === l.href || pathname.startsWith(l.href + "/");
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`nav-link${active ? " active" : ""}`}
                  aria-current={active ? "page" : undefined}
                  style={active ? { color: "var(--primary)", background: "rgba(183,148,244,0.08)" } : undefined}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="navbar-actions">
            {/* Cart */}
            <Link href="/cart" className="cart-btn" id="navbar-cart-btn" aria-label="Giỏ hàng">
              <ShoppingCart size={20} />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    key="badge"
                    className="cart-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    {totalItems > 99 ? "99+" : totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* Account area */}
            {isCustomer ? (
              <div className="user-menu" onMouseLeave={() => setDropdownOpen(false)}>
                <button
                  id="navbar-user-btn"
                  className="user-avatar-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-label="Tài khoản"
                >
                  <span className="user-avatar-initial">
                    {session!.user!.name?.charAt(0).toUpperCase()}
                  </span>
                  <span className="user-name-short">
                    {session!.user!.name?.split(" ").pop()}
                  </span>
                </button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      className="user-dropdown"
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                    >
                      <div className="dropdown-header">
                        <span style={{ fontWeight: 700 }}>{session!.user!.name}</span>
                        <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{session!.user!.email}</span>
                      </div>
                      <Link href="/account" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <User size={15} /> Tài khoản của tôi
                      </Link>
                      <Link href="/account/orders" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <ShoppingBag size={15} /> Đơn hàng
                      </Link>
                      <div className="dropdown-divider" />
                      <button
                        id="navbar-signout-btn"
                        className="dropdown-item danger"
                        onClick={() => signOut({ callbackUrl: "/" })}
                      >
                        <LogOut size={15} /> Đăng xuất
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link href="/account/login" className="btn-outline-sm">Đăng nhập</Link>
                <Link href="/repair" className="btn-primary-sm">
                  <CalendarCheck size={14} /> Đặt lịch
                </Link>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(true)}
              aria-label="Mở menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile slide-in menu */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="mobile-nav" role="dialog" aria-modal="true" aria-label="Menu điều hướng">
            <motion.div
              className="mobile-nav-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="mobile-nav-panel"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Panel header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                <Link href="/" className="navbar-logo" onClick={() => setMobileOpen(false)}>
                  <Smartphone size={18} style={{ color: "var(--primary)" }} />
                  <span className="logo-text">cellphone<span className="logo-accent">LT</span></span>
                </Link>
                <button
                  className="mobile-menu-btn"
                  style={{ display: "flex" }}
                  onClick={() => setMobileOpen(false)}
                  aria-label="Đóng menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Nav links */}
              {navLinks.map((l, i) => {
                const active = pathname === l.href || pathname.startsWith(l.href + "/");
                const Icon = l.icon;
                return (
                  <motion.div
                    key={l.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.25 }}
                  >
                    <Link
                      href={l.href}
                      className={`mobile-nav-link${active ? " active" : ""}`}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Icon size={18} />
                      {l.label}
                      <ChevronRight size={15} style={{ marginLeft: "auto", opacity: 0.4 }} />
                    </Link>
                  </motion.div>
                );
              })}

              <div style={{ height: "1px", background: "var(--border)", margin: "1rem 0" }} />

              {isCustomer ? (
                <>
                  <Link href="/account" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
                    <User size={18} /> Tài khoản
                  </Link>
                  <button
                    className="mobile-nav-link"
                    style={{ border: "none", background: "none", width: "100%", textAlign: "left", color: "var(--danger)" }}
                    onClick={() => { signOut({ callbackUrl: "/" }); setMobileOpen(false); }}
                  >
                    <LogOut size={18} /> Đăng xuất
                  </button>
                </>
              ) : (
                <Link href="/account/login" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
                  <User size={18} /> Đăng nhập
                </Link>
              )}

              {/* CTA */}
              <Link
                href="/repair"
                className="btn-primary"
                style={{ marginTop: "1rem", width: "100%", justifyContent: "center" }}
                onClick={() => setMobileOpen(false)}
              >
                <CalendarCheck size={16} /> Đặt lịch sửa chữa
              </Link>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
