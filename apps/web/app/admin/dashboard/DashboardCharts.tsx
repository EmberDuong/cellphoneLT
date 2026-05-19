"use client";

import { useEffect, useState } from "react";
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444', '#10b981', '#6b7280'];

export default function DashboardCharts() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/metrics")
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>Đang tải dữ liệu biểu đồ...</div>;
  }

  if (!data) return null;

  return (
    <>
      <div className="kpi-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="kpi-card">
          <span className="kpi-label">Tổng sản phẩm đã bán</span>
          <span className="kpi-value">{data.totalProductsSold || 0}</span>
          <span className="kpi-change up">Cập nhật lúc này</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Tổng đơn hàng 7 ngày</span>
          <span className="kpi-value">{data.overallOrdersCount || 0}</span>
          <span className="kpi-change up">Cập nhật lúc này</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Đơn sửa chữa đang chờ</span>
          <span className="kpi-value">{data.repairData.find((r: any) => r.name === 'intake')?.value || 0}</span>
          <span className="kpi-change up">Cập nhật lúc này</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Linh kiện sắp hết</span>
          <span className="kpi-value">{data.lowStock.length}</span>
          <span className="kpi-change down">Cần nhập kho</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
        
        {/* Revenue Chart */}
        <div className="card" style={{ padding: "1.5rem", background: "var(--card-bg, #fff)", borderRadius: "8px", border: "1px solid var(--border-color, #eaeaea)" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "1rem" }}>Doanh thu & Số đơn hàng (7 ngày qua)</h2>
          <div style={{ height: 300, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.revenueData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--text-muted)" }} />
                <YAxis 
                  yAxisId="left"
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: "var(--text-muted)" }}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: "var(--text-muted)" }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
                  formatter={(value: number, name: string) => {
                    if (name === "total") return [`${value.toLocaleString('vi-VN')}đ`, 'Doanh thu'];
                    if (name === "orders") return [value, 'Đơn hàng'];
                    return [value, name];
                  }}
                />
                <Legend />
                <Bar yAxisId="right" dataKey="orders" name="Số đơn hàng" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={40} />
                <Line yAxisId="left" type="monotone" dataKey="total" name="Doanh thu" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gridTemplateRows: "1fr 1fr", gap: "1.5rem" }}>
          {/* Top Selling Products Bar Chart */}
          <div className="card" style={{ padding: "1.5rem", background: "var(--card-bg, #fff)", borderRadius: "8px", border: "1px solid var(--border-color, #eaeaea)" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "1rem" }}>Top sản phẩm bán chạy</h2>
            <div style={{ height: 250, width: "100%" }}>
              {data.topSellingData?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart layout="vertical" data={data.topSellingData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#eee" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--text-muted)" }} />
                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--text-muted)" }} width={100} />
                    <Tooltip 
                      contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
                      formatter={(value: number) => [value, 'Đã bán']}
                    />
                    <Bar dataKey="quantity" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={15} />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                  Chưa có dữ liệu bán hàng
                </div>
              )}
            </div>
          </div>

          {/* Repairs Pie Chart */}
          <div className="card" style={{ padding: "1.5rem", background: "var(--card-bg, #fff)", borderRadius: "8px", border: "1px solid var(--border-color, #eaeaea)" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "1rem" }}>Trạng thái sửa chữa</h2>
            <div style={{ height: 250, width: "100%" }}>
              {data.repairData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.repairData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.repairData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                  Chưa có dữ liệu sửa chữa
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
