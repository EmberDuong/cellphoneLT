"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

const navGroups = [
  {
    label: "Phân tích",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    ],
  },
  {
    label: "Kinh doanh",
    items: [
      { href: "/admin/products", label: "Kho hàng hóa", icon: "📦" },
      { href: "/admin/inventory", label: "Kho IMEI", icon: "📱" },
      { href: "/admin/orders", label: "Đơn hàng", icon: "🛒" },
    ],
  },
  {
    label: "Dịch vụ",
    items: [
      { href: "/admin/repairs", label: "Sửa chữa", icon: "🔧" },
      { href: "/admin/trade-ins", label: "Thu mua máy", icon: "♻️" },
    ],
  },
  {
    label: "Quản trị",
    items: [
      { href: "/admin/customers", label: "Khách hàng", icon: "👥" },
      { href: "/admin/settings", label: "Cài đặt", icon: "⚙️" },
    ],
  },
];

export function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-logo">
        <span className="logo-icon">📱</span>
        <span className="logo-text">
          cellphone<span className="logo-accent">LT</span>
        </span>
        <span style={{ fontSize: "0.65rem", padding: "0.15rem 0.4rem", background: "var(--surface-2)", borderRadius: 4, marginLeft: "auto", color: "var(--text-muted)" }}>
          ADMIN
        </span>
      </div>

      <nav className="admin-nav">
        {navGroups.map((group) => (
          <div key={group.label} className="admin-nav-group">
            <div className="admin-nav-group-label">{group.label}</div>
            {group.items.map((item) => (
              <Link key={item.href} href={item.href} className="admin-nav-item">
                <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div style={{ padding: "1rem", borderTop: "1px solid var(--border)" }}>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          style={{ width: "100%", background: "transparent", border: "none", color: "var(--danger)", fontSize: "0.85rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", padding: "0.5rem" }}
        >
          <span>🚪</span> Đăng xuất
        </button>
      </div>
    </aside>
  );
}
