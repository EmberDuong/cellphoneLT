"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { DataTable } from "@/components/admin/ui/DataTable";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";

interface OrderItem {
  id: string;
  customerName: string | null;
  totalAmount: string;
  status: string;
  paymentStatus: string;
  createdAt: Date;
}

export function SalesDashboardClient({ orders }: { orders: OrderItem[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Format VND Helper
  const formatVND = (value: number) => {
    return value.toLocaleString("vi-VN") + "đ";
  };

  // KPI Calculations (based on all orders)
  const kpis = useMemo(() => {
    const totalOrdersCount = orders.length;
    const completedOrders = orders.filter((o) => o.status === "delivered");
    const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "processing");
    
    const totalRevenue = completedOrders.reduce(
      (sum, o) => sum + parseFloat(o.totalAmount || "0"),
      0
    );

    const aov = totalOrdersCount > 0 
      ? orders.reduce((sum, o) => sum + parseFloat(o.totalAmount || "0"), 0) / totalOrdersCount 
      : 0;

    return {
      totalRevenue,
      totalOrdersCount,
      completedCount: completedOrders.length,
      pendingCount: pendingOrders.length,
      aov
    };
  }, [orders]);

  // Filter & Search Logic
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // 1. Search filter
      const matchesSearch = 
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.customerName || "Khách vô danh").toLowerCase().includes(searchTerm.toLowerCase());

      // 2. Tab filter
      if (activeTab === "all") return matchesSearch;
      if (activeTab === "pending") return matchesSearch && (o.status === "pending" || o.status === "processing");
      if (activeTab === "shipped") return matchesSearch && o.status === "shipped";
      if (activeTab === "delivered") return matchesSearch && o.status === "delivered";
      if (activeTab === "cancelled") return matchesSearch && o.status === "cancelled";

      return matchesSearch;
    });
  }, [orders, searchTerm, activeTab]);

  // Export CSV Helper
  const handleExportCSV = () => {
    const headers = ["Mã đơn hàng", "Ngày đặt", "Khách hàng", "Tổng tiền", "Thanh toán", "Trạng thái"];
    const rows = filteredOrders.map((o) => [
      `#${o.id.substring(0, 8)}`,
      new Date(o.createdAt).toLocaleDateString("vi-VN"),
      o.customerName || "Khách vô danh",
      o.totalAmount,
      o.paymentStatus,
      o.status
    ]);

    const csvContent = 
      "data:text/csv;charset=utf-8,\uFEFF" + 
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Bao_cao_don_hang_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      
      {/* 📊 KPI Metrics Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Tổng doanh thu</div>
          <div className="kpi-value">{formatVND(kpis.totalRevenue)}</div>
          <div className="kpi-change up">★ Từ đơn đã hoàn thành</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Số đơn hàng</div>
          <div className="kpi-value">{kpis.totalOrdersCount}</div>
          <div className="kpi-change">Tổng số giao dịch</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Đơn hàng cần xử lý</div>
          <div className="kpi-value">{kpis.pendingCount}</div>
          <div className="kpi-change down" style={{ color: "var(--warning)" }}>⚠️ Chờ giao & duyệt</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Giá trị trung bình (AOV)</div>
          <div className="kpi-value">{formatVND(kpis.aov)}</div>
          <div className="kpi-change up">Doanh thu / Tổng đơn</div>
        </div>
      </div>

      {/* 🔍 Controls & Search Header */}
      <div style={{
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        gap: "1rem",
        background: "rgba(22, 27, 34, 0.4)",
        padding: "1rem 1.5rem",
        borderRadius: "var(--radius-md)",
        border: "1px solid rgba(255, 255, 255, 0.04)"
      }}>
        {/* Status Tab buttons */}
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          {[
            { id: "all", label: "Tất cả" },
            { id: "pending", label: "Chờ xử lý" },
            { id: "shipped", label: "Đang giao" },
            { id: "delivered", label: "Đã hoàn thành" },
            { id: "cancelled", label: "Đã hủy" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={activeTab === tab.id ? "btn-primary-sm" : "btn-outline-sm"}
              style={{
                fontSize: "0.82rem",
                padding: "0.4rem 0.85rem",
                borderRadius: "var(--radius-sm)",
                background: activeTab === tab.id ? "linear-gradient(135deg, var(--primary), var(--accent))" : "rgba(255,255,255,0.02)",
                color: activeTab === tab.id ? "#fff" : "var(--text-muted)",
                border: activeTab === tab.id ? "none" : "1px solid rgba(255,255,255,0.08)",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={handleExportCSV}
          className="btn-outline-sm"
          style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1rem" }}
        >
          📥 Xuất file Excel (CSV)
        </button>
      </div>

      {/* 📋 Data Table */}
      <DataTable
        title="Danh sách đơn hàng bán ra"
        searchPlaceholder="Tìm theo Tên KH hoặc Mã ĐH..."
        onSearchChange={setSearchTerm}
        columns={["Mã ĐH", "Ngày đặt", "Khách hàng", "Tổng tiền", "Thanh toán", "Trạng thái", <div style={{textAlign:"right"}}>Chi tiết</div>]}
        isEmpty={filteredOrders.length === 0}
      >
        {filteredOrders.map((o) => (
          <tr key={o.id}>
            <td style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: 600 }}>
              #{o.id.substring(0, 8)}
            </td>
            <td>{new Date(o.createdAt).toLocaleDateString("vi-VN")}</td>
            <td>{o.customerName || "Khách vô danh"}</td>
            <td style={{ fontWeight: 600, color: "var(--primary)" }}>
              {formatVND(parseFloat(o.totalAmount))}
            </td>
            <td>
              <StatusBadge status={o.paymentStatus} variant={o.paymentStatus === 'paid' ? 'active' : 'draft'} />
            </td>
            <td>
              <StatusBadge status={o.status} />
            </td>
            <td style={{ textAlign: "right" }}>
              <Link href={`/admin/orders/${o.id}`} className="btn-outline-sm" style={{ padding: "0.2rem 0.6rem", fontSize: "0.8rem", textDecoration: "none" }}>
                Xem
              </Link>
            </td>
          </tr>
        ))}
      </DataTable>

    </div>
  );
}
