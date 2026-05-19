"use client";

import { useTransition } from "react";
import { updateRepairStatusAction } from "../actions";

export default function RepairDetails({ 
  ticket, 
  customer 
}: { 
  ticket: any; 
  customer: any; 
}) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    startTransition(async () => {
      await updateRepairStatusAction(ticket.id, newStatus);
    });
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
      {/* Left Column: Repair Details */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div className="card" style={{ padding: "1.5rem", background: "var(--card-bg, #fff)", borderRadius: "8px", border: "1px solid var(--border-color, #eaeaea)" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "1rem" }}>Thông tin thiết bị</h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
            <div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Hãng / Model</p>
              <p style={{ fontWeight: 500 }}>{ticket.deviceBrand} - {ticket.deviceModel}</p>
            </div>
            <div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Màu sắc</p>
              <p style={{ fontWeight: 500 }}>{ticket.deviceColor || "N/A"}</p>
            </div>
            <div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>IMEI / Serial</p>
              <p style={{ fontWeight: 500 }}>{ticket.deviceImei || "N/A"}</p>
            </div>
          </div>

          <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.5rem" }}>Tình trạng báo lỗi</h3>
          <div style={{ padding: "1rem", background: "var(--surface-2, #f9fafb)", borderRadius: "6px", marginBottom: "1.5rem" }}>
            <p>{ticket.reportedIssue}</p>
          </div>
          
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.5rem" }}>Ghi chú kỹ thuật</h3>
          <div style={{ padding: "1rem", background: "var(--surface-2, #f9fafb)", borderRadius: "6px" }}>
            <p>{ticket.technicianNotes || "Chưa có ghi chú."}</p>
          </div>
        </div>
      </div>

      {/* Right Column: Status Info & Customer */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Status Update Card */}
        <div className="card" style={{ padding: "1.5rem", background: "var(--card-bg, #fff)", borderRadius: "8px", border: "1px solid var(--border-color, #eaeaea)" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "1rem" }}>Cập nhật tiến độ</h2>
          
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>Trạng thái sửa chữa</label>
            <select 
              className="form-input" 
              style={{ width: "100%" }} 
              defaultValue={ticket.status}
              onChange={handleStatusChange}
              disabled={isPending}
            >
              <option value="intake">Mới tiếp nhận</option>
              <option value="diagnosing">Đang chuẩn đoán</option>
              <option value="awaiting_parts">Chờ linh kiện</option>
              <option value="in_progress">Đang sửa chữa</option>
              <option value="quality_check">Kiểm tra chất lượng</option>
              <option value="done">Đã xong (chờ lấy)</option>
              <option value="delivered">Đã trả máy</option>
              <option value="cancelled">Hủy bỏ</option>
            </select>
          </div>
          
          <div style={{ marginBottom: "1rem" }}>
             <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Chi phí dự kiến</p>
             <p style={{ fontWeight: 600, color: "var(--primary)" }}>{ticket.estimatedCost ? Number(ticket.estimatedCost).toLocaleString('vi-VN') + 'đ' : 'Chưa báo giá'}</p>
          </div>
        </div>

        {/* Customer Card */}
        <div className="card" style={{ padding: "1.5rem", background: "var(--card-bg, #fff)", borderRadius: "8px", border: "1px solid var(--border-color, #eaeaea)" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "1rem" }}>Khách hàng</h2>
          {customer ? (
            <div style={{ fontSize: "0.9rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <p><strong>Họ tên:</strong> {customer.fullName}</p>
              <p><strong>Số điện thoại:</strong> {customer.phoneNumber}</p>
              <p><strong>Email:</strong> {customer.email || "N/A"}</p>
            </div>
          ) : (
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Không tìm thấy thông tin</p>
          )}
        </div>
      </div>
    </div>
  );
}
