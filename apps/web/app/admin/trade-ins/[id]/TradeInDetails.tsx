"use client";

import { useTransition, useState } from "react";
import { updateTradeInStatusAction, updateFinalPriceAction } from "../actions";

export default function TradeInDetails({ 
  tradeIn, 
  customer 
}: { 
  tradeIn: any; 
  customer: any; 
}) {
  const [isPending, startTransition] = useTransition();
  const [priceInput, setPriceInput] = useState(tradeIn.finalAgreedPrice || tradeIn.aiOfferedPrice || "");

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    startTransition(async () => {
      await updateTradeInStatusAction(tradeIn.id, newStatus);
    });
  };

  const handleSavePrice = () => {
    startTransition(async () => {
      await updateFinalPriceAction(tradeIn.id, Number(priceInput));
    });
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
      {/* Left Column: Device & Condition Details */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div className="card" style={{ padding: "1.5rem", background: "var(--card-bg, #fff)", borderRadius: "8px", border: "1px solid var(--border-color, #eaeaea)" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "1rem" }}>Thông tin thiết bị thu cũ</h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
            <div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Hãng</p>
              <p style={{ fontWeight: 500 }}>{tradeIn.deviceBrand}</p>
            </div>
            <div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Model</p>
              <p style={{ fontWeight: 500 }}>{tradeIn.deviceModel}</p>
            </div>
            <div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Dung lượng</p>
              <p style={{ fontWeight: 500 }}>{tradeIn.deviceStorage || "N/A"}</p>
            </div>
          </div>

          <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.5rem" }}>Tình trạng ngoại hình (Khách khai báo)</h3>
          <div style={{ padding: "1rem", background: "var(--surface-2, #f9fafb)", borderRadius: "6px", marginBottom: "1.5rem" }}>
            <pre style={{ fontSize: "0.9rem", whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
              {JSON.stringify(tradeIn.physicalCondition, null, 2)}
            </pre>
          </div>
          
          {tradeIn.functionalStatus && (
            <>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.5rem" }}>Tình trạng chức năng</h3>
              <div style={{ padding: "1rem", background: "var(--surface-2, #f9fafb)", borderRadius: "6px" }}>
                <pre style={{ fontSize: "0.9rem", whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
                  {JSON.stringify(tradeIn.functionalStatus, null, 2)}
                </pre>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Column: Pricing, Status & Customer */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        {/* Pricing Card */}
        <div className="card" style={{ padding: "1.5rem", background: "var(--card-bg, #fff)", borderRadius: "8px", border: "1px solid var(--border-color, #eaeaea)" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "1rem" }}>Định giá thu mua</h2>
          
          <div style={{ marginBottom: "1.5rem" }}>
             <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Giá AI đề xuất ban đầu</p>
             <p style={{ fontWeight: 600, color: "var(--text-muted)", fontSize: "1.1rem" }}>
               {tradeIn.aiOfferedPrice ? Number(tradeIn.aiOfferedPrice).toLocaleString('vi-VN') + 'đ' : 'Đang tính...'}
             </p>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>Giá chốt cuối cùng (VNĐ)</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input 
                type="number" 
                className="form-input" 
                style={{ width: "100%" }} 
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                disabled={isPending}
              />
              <button className="btn-primary" onClick={handleSavePrice} disabled={isPending}>Lưu</button>
            </div>
          </div>
        </div>

        {/* Status Update Card */}
        <div className="card" style={{ padding: "1.5rem", background: "var(--card-bg, #fff)", borderRadius: "8px", border: "1px solid var(--border-color, #eaeaea)" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "1rem" }}>Trạng thái</h2>
          
          <div>
            <select 
              className="form-input" 
              style={{ width: "100%" }} 
              defaultValue={tradeIn.status}
              onChange={handleStatusChange}
              disabled={isPending}
            >
              <option value="pending">Chờ kiểm tra vật lý</option>
              <option value="inspecting">Đang kiểm tra tại cửa hàng</option>
              <option value="offer_sent">Đã báo giá cuối</option>
              <option value="accepted">Khách đồng ý bán</option>
              <option value="rejected">Khách từ chối bán</option>
              <option value="cancelled">Hủy bỏ</option>
            </select>
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
