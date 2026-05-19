import type { Metadata } from "next";
import DashboardCharts from "./DashboardCharts";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  const today = new Date().toLocaleDateString("vi-VN");

  return (
    <>
      <header className="admin-topbar">
        <h1 className="admin-topbar-title">Dashboard Tổng quan</h1>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Hôm nay: {today}</span>
          <div style={{ width: 32, height: 32, borderRadius: 99, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", fontWeight: 700 }}>A</div>
        </div>
      </header>

      <main className="admin-content">
        {/* Dynamic Charts & KPIs loaded from client component */}
        <DashboardCharts />
      </main>
    </>
  );
}
