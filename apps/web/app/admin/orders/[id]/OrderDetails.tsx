"use client";

import { useState, useTransition } from "react";
import { updateOrderStatusAction, updatePaymentStatusAction } from "../actions";

export default function OrderDetails({ 
  order, 
  items, 
  customer 
}: { 
  order: any; 
  items: any[]; 
  customer: any; 
}) {
  const [isPending, startTransition] = useTransition();
  const [orderStatus, setOrderStatus] = useState(order.status);
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);

  const showDeliveryWarning = orderStatus === "delivered" && paymentStatus === "pending";

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setOrderStatus(newStatus);
    startTransition(async () => {
      await updateOrderStatusAction(order.id, newStatus);
    });
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setPaymentStatus(newStatus);
    startTransition(async () => {
      await updatePaymentStatusAction(order.id, newStatus);
    });
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
      {/* Left Column: Order Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div className="card" style={{ padding: "1.5rem", background: "var(--card-bg, #fff)", borderRadius: "8px", border: "1px solid var(--border-color, #eaeaea)" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "1rem" }}>Sản phẩm ({items.length})</h2>
          
          <table className="data-table" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", paddingBottom: "0.5rem" }}>Sản phẩm</th>
                <th style={{ textAlign: "center", paddingBottom: "0.5rem" }}>Số lượng</th>
                <th style={{ textAlign: "right", paddingBottom: "0.5rem" }}>Đơn giá</th>
                <th style={{ textAlign: "right", paddingBottom: "0.5rem" }}>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid var(--border-color, #eaeaea)" }}>
                  <td style={{ padding: "1rem 0" }}>
                    <div style={{ fontWeight: 500 }}>{item.productName}</div>
                  </td>
                  <td style={{ textAlign: "center", padding: "1rem 0" }}>{item.quantity}</td>
                  <td style={{ textAlign: "right", padding: "1rem 0" }}>{Number(item.unitPrice).toLocaleString('vi-VN')}đ</td>
                  <td style={{ textAlign: "right", padding: "1rem 0", fontWeight: 600 }}>{Number(item.subtotal).toLocaleString('vi-VN')}đ</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} style={{ textAlign: "right", padding: "1rem 0", fontWeight: 600 }}>Tổng cộng:</td>
                <td style={{ textAlign: "right", padding: "1rem 0", fontWeight: 700, color: "var(--primary)", fontSize: "1.1rem" }}>
                  {Number(order.totalAmount).toLocaleString('vi-VN')}đ
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Right Column: Order Info & Customer */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Status Update Card */}
        <div className="card" style={{ padding: "1.5rem", background: "var(--card-bg, #fff)", borderRadius: "8px", border: "1px solid var(--border-color, #eaeaea)" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "1rem" }}>Cập nhật trạng thái</h2>

          {showDeliveryWarning && (
            <div style={{ marginBottom: "1rem", padding: "0.75rem", background: "#fef9c3", color: "#92400e", borderRadius: "6px", fontSize: "0.85rem", border: "1px solid #fde68a" }}>
              ⚠️ Đơn hàng đang được đánh dấu <strong>Đã giao</strong> nhưng thanh toán vẫn <strong>Chờ thanh toán</strong>. Hãy xác nhận thanh toán nếu khách đã trả tiền.
            </div>
          )}
          
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>Trạng thái đơn hàng</label>
            <select 
              className="form-input" 
              style={{ width: "100%" }} 
              value={orderStatus}
              onChange={handleStatusChange}
              disabled={isPending}
            >
              <option value="pending">Chờ xác nhận</option>
              <option value="processing">Đang xử lý</option>
              <option value="shipped">Đang giao</option>
              <option value="delivered">Đã giao</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>Trạng thái thanh toán</label>
            <select 
              className="form-input" 
              style={{ width: "100%" }} 
              value={paymentStatus}
              onChange={handlePaymentChange}
              disabled={isPending}
            >
              <option value="pending">Chờ thanh toán</option>
              <option value="paid">Đã thanh toán</option>
              <option value="refunded">Đã hoàn tiền</option>
            </select>
          </div>
        </div>

        {/* Customer Card */}
        <div className="card" style={{ padding: "1.5rem", background: "var(--card-bg, #fff)", borderRadius: "8px", border: "1px solid var(--border-color, #eaeaea)" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "1rem" }}>Thông tin khách hàng</h2>
          {customer ? (
            <div style={{ fontSize: "0.9rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <p><strong>Họ tên:</strong> {customer.fullName}</p>
              <p><strong>Số điện thoại:</strong> {customer.phoneNumber}</p>
              <p><strong>Email:</strong> {customer.email || "N/A"}</p>
            </div>
          ) : (
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Khách hàng vô danh</p>
          )}
          
          <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color, #eaeaea)", fontSize: "0.9rem" }}>
            <h3 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Địa chỉ giao hàng</h3>
            <p>{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.phoneNumber}</p>
            <p>{order.shippingAddress.address}</p>
            <p>{order.shippingAddress.city}</p>
            {order.shippingAddress.note && (
              <p style={{ marginTop: "0.5rem", fontStyle: "italic", color: "var(--text-muted)" }}>
                Ghi chú: {order.shippingAddress.note}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
