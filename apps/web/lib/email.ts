import { Resend } from "resend";

const FROM_EMAIL = "CellphoneLT <onboarding@resend.dev>";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}


// ─── Email Templates ───────────────────────────────────────────────────────────

function orderConfirmationTemplate(data: {
  customerName: string;
  orderId: string;
  productName: string;
  quantity: number;
  totalAmount: number;
  address: string;
  city: string;
  estimatedDays?: number;
}): string {
  const total = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(data.totalAmount);
  const eta = data.estimatedDays
    ? `<p>🚚 <strong>Dự kiến giao hàng:</strong> ${data.estimatedDays}–${data.estimatedDays + 1} ngày làm việc</p>`
    : "";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0d1117; color: #e6edf3; padding: 32px; border-radius: 12px; border: 1px solid #30363d;">
      <h1 style="color: #b794f4; font-size: 22px; margin-bottom: 4px;">✅ Đơn hàng đã được xác nhận!</h1>
      <p style="color: #8b949e; font-size: 14px;">Xin chào ${data.customerName}, đơn hàng của bạn đã được tiếp nhận.</p>
      
      <div style="background: #161b22; border: 1px solid #21262d; border-radius: 8px; padding: 20px; margin: 24px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 8px 0; color: #8b949e;">Mã đơn hàng</td><td style="text-align:right; font-family: monospace; font-weight: bold;">${data.orderId.slice(0, 8).toUpperCase()}</td></tr>
          <tr><td style="padding: 8px 0; color: #8b949e;">Sản phẩm</td><td style="text-align:right;">${data.productName} × ${data.quantity}</td></tr>
          <tr><td style="padding: 8px 0; color: #8b949e;">Địa chỉ giao</td><td style="text-align:right;">${data.address}, ${data.city}</td></tr>
          <tr style="border-top: 1px solid #21262d;"><td style="padding: 12px 0; font-weight: bold;">Tổng tiền</td><td style="text-align:right; color: #10b981; font-weight: bold; font-size: 16px;">${total}</td></tr>
        </table>
      </div>
      ${eta}
      <p style="color: #8b949e; font-size: 12px; margin-top: 24px;">Nếu có thắc mắc, vui lòng liên hệ chúng tôi qua chatbot hoặc hotline.<br/>— CellphoneLT Team</p>
    </div>
  `;
}

function orderStatusUpdateTemplate(data: {
  customerName: string;
  orderId: string;
  newStatus: string;
  estimatedDays?: number;
}): string {
  const statusMap: Record<string, { label: string; emoji: string; color: string }> = {
    processing: { label: "Đang xử lý", emoji: "⚙️", color: "#f59e0b" },
    shipped:    { label: "Đã giao vận chuyển", emoji: "🚚", color: "#3b82f6" },
    delivered:  { label: "Đã giao thành công", emoji: "✅", color: "#10b981" },
    cancelled:  { label: "Đã hủy", emoji: "❌", color: "#ef4444" },
  };
  const s = statusMap[data.newStatus] ?? { label: data.newStatus, emoji: "📦", color: "#b794f4" };
  const eta = data.estimatedDays
    ? `<p style="color: #8b949e;">🗓️ Dự kiến đến nơi trong <strong style="color:#e6edf3;">${data.estimatedDays}–${data.estimatedDays + 1} ngày</strong> làm việc.</p>`
    : "";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0d1117; color: #e6edf3; padding: 32px; border-radius: 12px; border: 1px solid #30363d;">
      <h1 style="color: ${s.color}; font-size: 22px;">${s.emoji} Trạng thái đơn hàng đã cập nhật</h1>
      <p style="color: #8b949e;">Xin chào ${data.customerName}, đơn hàng <strong style="font-family:monospace;">${data.orderId.slice(0, 8).toUpperCase()}</strong> của bạn đã được cập nhật.</p>

      <div style="background: #161b22; border: 1px solid ${s.color}33; border-left: 3px solid ${s.color}; border-radius: 8px; padding: 16px; margin: 24px 0; font-size: 16px; font-weight: bold;">
        ${s.emoji} ${s.label}
      </div>
      ${eta}
      <p style="color: #8b949e; font-size: 12px; margin-top: 24px;">— CellphoneLT Team</p>
    </div>
  `;
}

// ─── Send Functions ────────────────────────────────────────────────────────────

export async function sendOrderConfirmationEmail(
  to: string,
  data: Parameters<typeof orderConfirmationTemplate>[0]
) {
  if (!process.env.RESEND_API_KEY) {
    console.log("[email] No RESEND_API_KEY set — logging email instead:");
    console.log("[email] To:", to, "| Subject: Xác nhận đơn hàng #", data.orderId.slice(0, 8).toUpperCase());
    return { success: true };
  }

  try {
    const client = getResend()!;
    const { error } = await client.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `✅ Xác nhận đơn hàng #${data.orderId.slice(0, 8).toUpperCase()} — CellphoneLT`,
      html: orderConfirmationTemplate(data),
    });
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error("[email] Failed to send order confirmation:", err);
    return { success: false };
  }
}

export async function sendOrderStatusEmail(
  to: string,
  data: Parameters<typeof orderStatusUpdateTemplate>[0]
) {
  if (!process.env.RESEND_API_KEY) {
    console.log("[email] No RESEND_API_KEY set — logging email instead:");
    console.log("[email] To:", to, "| Subject: Cập nhật đơn hàng #", data.orderId.slice(0, 8).toUpperCase(), "| Status:", data.newStatus);
    return { success: true };
  }

  try {
    const client = getResend()!;
    const { error } = await client.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `📦 Cập nhật đơn hàng #${data.orderId.slice(0, 8).toUpperCase()} — ${data.newStatus}`,
      html: orderStatusUpdateTemplate(data),
    });
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error("[email] Failed to send status update:", err);
    return { success: false };
  }
}
