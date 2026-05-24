"use client";

import { useChat } from "ai/react";
import { useRef, useEffect, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import {
  Sparkles, Send, Bot, Loader2, Paperclip, X,
  Package, ShoppingCart, Truck, CheckCircle, XCircle,
  BarChart2, Wrench, Users, FileSpreadsheet, Plus, ClipboardList,
  ChevronRight, ChevronLeft
} from "lucide-react";

// ─── Tool Result Cards ────────────────────────────────────────────────────────

function OrdersCard({ orders }: { orders: any[] }) {
  if (!orders?.length) return <p className="text-xs text-[var(--text-muted)] italic">Không có đơn hàng.</p>;
  return (
    <div className="copilot-card">
      <p className="copilot-card-title"><ShoppingCart size={12} /> Đơn hàng ({orders.length})</p>
      <div className="flex flex-col gap-2">
        {orders.map((o: any) => (
          <div key={o.id} className="copilot-row">
            <div className="flex justify-between mb-1">
              <span className="font-bold text-[var(--text)] text-xs">{o.customerName}</span>
              <span className="font-mono text-[10px] text-[var(--text-faint)]">#{o.shortId}</span>
            </div>
            <div className="text-[10px] text-[var(--text-muted)]">📍 {o.city} · 📱 {o.customerPhone}</div>
            <div className="flex justify-between items-center mt-1">
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                o.status === "pending" ? "bg-yellow-500/15 text-yellow-400" :
                o.status === "processing" ? "bg-blue-500/15 text-blue-400" :
                o.status === "shipped" ? "bg-cyan-500/15 text-cyan-400" :
                o.status === "delivered" ? "bg-green-500/15 text-green-400" :
                "bg-red-500/15 text-red-400"
              }`}>{o.status}</span>
              <span className="text-xs font-bold text-[var(--success)]">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(o.totalAmount)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InventoryCard({ summary }: { summary: any }) {
  return (
    <div className="copilot-card">
      <p className="copilot-card-title"><Package size={12} /> Kho hàng</p>
      <div className="text-sm mb-2 text-[var(--text)]">Tổng: <span className="font-bold text-[var(--primary)]">{summary.totalInventoryItems}</span></div>
      {summary.lowStockAlerts?.length > 0 && (
        <>
          <p className="text-[10px] font-bold text-[var(--danger)] uppercase mb-1.5">⚠️ Sắp hết ({summary.lowStockAlerts.length})</p>
          {summary.lowStockAlerts.map((item: any, i: number) => (
            <div key={i} className="flex justify-between items-center bg-[rgba(244,63,94,0.08)] border border-[rgba(244,63,94,0.2)] p-1.5 rounded-lg text-[10px] mb-1">
              <span className="text-[var(--text)] truncate flex-1 pr-2">{item.productName}</span>
              <span className="font-bold text-[var(--danger)]">SL: {item.quantity}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function StatusUpdateCard({ res }: { res: any }) {
  return (
    <div className={`copilot-card border ${res.success ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"}`}>
      <div className={`flex items-center gap-2 font-semibold text-xs mb-1 ${res.success ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
        {res.success ? <CheckCircle size={14} /> : <XCircle size={14} />}
        {res.success ? "Cập nhật thành công" : "Thất bại"}
      </div>
      {res.success ? (
        <div className="text-[10px] text-[var(--text-muted)] space-y-0.5">
          <div>Đơn <span className="font-mono font-bold text-[var(--text)]">#{res.shortId}</span></div>
          {res.oldStatus && <div>{res.oldStatus} → <span className="font-bold text-[var(--text)]">{res.newStatus}</span></div>}
          {res.emailSent && <div>📧 Email đã gửi</div>}
          {res.successCount !== undefined && <div>✅ {res.successCount} đơn đã cập nhật</div>}
        </div>
      ) : (
        <div className="text-[10px] text-[var(--danger)]">{res.reason}</div>
      )}
    </div>
  );
}

function DeliveryCard({ est }: { est: any }) {
  return (
    <div className="copilot-card bg-[rgba(11,197,234,0.04)] border-[rgba(11,197,234,0.2)]">
      <p className="copilot-card-title text-[var(--accent)]"><Truck size={12} /> Ước tính giao hàng</p>
      <div className="text-xs space-y-1.5">
        <div className="flex justify-between"><span className="text-[var(--text-muted)]">Địa điểm</span><span className="font-semibold">{est.city} · {est.region}</span></div>
        <div className="flex justify-between"><span className="text-[var(--text-muted)]">Thời gian</span><span className="font-bold text-[var(--accent)]">{est.minDays}–{est.maxDays} ngày</span></div>
        <div className="flex justify-between"><span className="text-[var(--text-muted)]">Dự kiến</span><span>{est.estimatedArrivalMin} – {est.estimatedArrivalMax}</span></div>
      </div>
      <div className="mt-2 text-[10px] text-[var(--text-faint)] bg-white/3 rounded-lg p-1.5">{est.note}</div>
    </div>
  );
}

function DailyReportCard({ report }: { report: any }) {
  const fmt = (n: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
  return (
    <div className="copilot-card">
      <p className="copilot-card-title"><BarChart2 size={12} /> Báo cáo {report.date}</p>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {[
          { label: "Doanh thu", value: fmt(report.revenue), color: "text-[var(--success)]" },
          { label: "Đơn mới", value: report.newOrders, color: "text-[var(--primary)]" },
          { label: "Đơn chờ", value: report.pendingOrders, color: "text-yellow-400" },
          { label: "Sửa chữa mở", value: report.repairOpen, color: "text-[var(--accent)]" },
          { label: "Tổng kho", value: report.totalStock, color: "text-[var(--text)]" },
          { label: "SP sắp hết", value: report.lowStockProducts, color: "text-[var(--danger)]" },
        ].map((item) => (
          <div key={item.label} className="bg-white/3 rounded-lg p-2">
            <div className="text-[10px] text-[var(--text-muted)]">{item.label}</div>
            <div className={`font-bold ${item.color}`}>{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RepairCard({ tickets }: { tickets: any[] }) {
  if (!tickets?.length) return <p className="text-xs text-[var(--text-muted)] italic">Không có phiếu.</p>;
  const statusColor: Record<string, string> = {
    intake: "text-gray-400", diagnosing: "text-blue-400",
    awaiting_parts: "text-yellow-400", in_progress: "text-cyan-400",
    quality_check: "text-purple-400", done: "text-green-400",
    delivered: "text-green-600", cancelled: "text-red-400",
  };
  return (
    <div className="copilot-card">
      <p className="copilot-card-title"><Wrench size={12} /> Phiếu sửa chữa ({tickets.length})</p>
      {tickets.map((t: any) => (
        <div key={t.id} className="copilot-row mb-2">
          <div className="flex justify-between">
            <span className="font-bold text-xs">{t.device}</span>
            <span className="font-mono text-[10px] text-[var(--text-faint)]">#{t.shortId}</span>
          </div>
          <div className="text-[10px] text-[var(--text-muted)]">{t.customerName} · {t.customerPhone}</div>
          <div className="flex justify-between mt-1">
            <span className={`text-[10px] font-bold ${statusColor[t.status] ?? "text-gray-400"}`}>{t.status}</span>
            {t.priority === "urgent" && <span className="text-[10px] bg-red-500/20 text-red-400 px-1 rounded">URGENT</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function CustomersCard({ customers }: { customers: any[] }) {
  if (!customers?.length) return <p className="text-xs text-[var(--text-muted)] italic">Không tìm thấy.</p>;
  return (
    <div className="copilot-card">
      <p className="copilot-card-title"><Users size={12} /> Khách hàng ({customers.length})</p>
      {customers.map((c: any) => (
        <div key={c.id} className="copilot-row mb-2">
          <div className="font-bold text-xs">{c.fullName}</div>
          <div className="text-[10px] text-[var(--text-muted)]">{c.phone} · {c.email}</div>
          <div className="flex gap-3 mt-1 text-[10px]">
            <span className="text-[var(--primary)]">{c.orderCount} đơn</span>
            <span className="text-[var(--success)]">{new Intl.NumberFormat("vi-VN", { notation: "compact" }).format(c.totalSpend)} VNĐ</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ImportCard({ res }: { res: any }) {
  return (
    <div className={`copilot-card ${res.success ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"}`}>
      <p className="copilot-card-title"><FileSpreadsheet size={12} /> Nhập Excel</p>
      {res.success ? (
        <div className="text-xs space-y-1">
          <div>📊 Tổng: <strong>{res.totalRows}</strong> dòng</div>
          <div>✅ Tạo mới: <strong className="text-green-400">{res.created}</strong></div>
          <div>🔄 Cập nhật: <strong className="text-blue-400">{res.updated}</strong></div>
          {res.skipped > 0 && <div>⏭️ Bỏ qua: <strong className="text-yellow-400">{res.skipped}</strong></div>}
          {res.errors?.length > 0 && <div className="text-[var(--danger)] text-[10px] mt-1">⚠️ {res.errors[0]}</div>}
        </div>
      ) : (
        <div className="text-xs text-[var(--danger)]">{res.reason}</div>
      )}
    </div>
  );
}

function ProductCard({ res }: { res: any }) {
  return (
    <div className={`copilot-card ${res.success ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"}`}>
      <div className={`flex items-center gap-2 font-semibold text-xs mb-1 ${res.success ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
        {res.success ? <CheckCircle size={14} /> : <XCircle size={14} />}
        {res.message ?? (res.success ? "Thành công" : "Thất bại")}
      </div>
      {res.success && res.productId && (
        <div className="text-[10px] text-[var(--text-muted)] font-mono">{res.productId.slice(0, 12)}…</div>
      )}
    </div>
  );
}

function TaskCard({ res }: { res: any }) {
  const priorityColor: Record<string, string> = {
    urgent: "text-red-400 bg-red-500/15", high: "text-orange-400 bg-orange-500/15",
    medium: "text-yellow-400 bg-yellow-500/15", low: "text-blue-400 bg-blue-500/15",
  };
  const pColor = priorityColor[res.task?.priority] ?? "text-gray-400";
  return (
    <div className="copilot-card border-purple-500/30 bg-purple-500/5">
      <p className="copilot-card-title"><ClipboardList size={12} /> Đã ghi nhận công việc</p>
      <div className="font-semibold text-xs text-[var(--text)] mb-1">{res.task?.title}</div>
      {res.task?.description && <div className="text-[10px] text-[var(--text-muted)] mb-1">{res.task.description}</div>}
      <div className="flex gap-2">
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${pColor}`}>{res.task?.priority?.toUpperCase()}</span>
        {res.task?.dueTime && <span className="text-[10px] text-[var(--text-muted)]">⏰ {res.task.dueTime}</span>}
      </div>
    </div>
  );
}

// ─── Tool Result Renderer ─────────────────────────────────────────────────────

function ToolResult({ toolName, result }: { toolName: string; result: any }) {
  if (toolName === "fetchOrders") return <OrdersCard orders={result} />;
  if (toolName === "getInventorySummary") return <InventoryCard summary={result} />;
  if (toolName === "updateOrderStatus" || toolName === "bulkUpdateOrders") return <StatusUpdateCard res={result} />;
  if (toolName === "estimateDelivery") return <DeliveryCard est={result} />;
  if (toolName === "getDailyReport") return <DailyReportCard report={result} />;
  if (toolName === "getRepairTickets") return <RepairCard tickets={result} />;
  if (toolName === "getCustomers") return <CustomersCard customers={result} />;
  if (toolName === "importInventoryFromExcel") return <ImportCard res={result} />;
  if (["updateProductStatus", "createProduct", "addInventoryItem", "updateRepairTicket"].includes(toolName)) return <ProductCard res={result} />;
  if (toolName === "scheduleTask") return <TaskCard res={result} />;
  if (toolName === "searchProducts") {
    const products = result as any[];
    if (!products?.length) return <p className="text-xs italic text-[var(--text-muted)]">Không tìm thấy sản phẩm.</p>;
    return (
      <div className="copilot-card">
        <p className="copilot-card-title"><Package size={12} /> Sản phẩm ({products.length})</p>
        {products.map((p: any) => (
          <div key={p.id} className="copilot-row mb-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-[var(--text)] truncate pr-2">{p.name}</span>
              <span className={`text-[10px] px-1.5 rounded font-bold ${p.status === "active" ? "text-green-400 bg-green-500/15" : p.status === "archived" ? "text-gray-400 bg-gray-500/15" : "text-yellow-400 bg-yellow-500/15"}`}>{p.status}</span>
            </div>
            <div className="flex justify-between mt-0.5 text-[10px] text-[var(--text-muted)]">
              <span>Kho: {p.stock}</span>
              <span className="text-[var(--success)]">{new Intl.NumberFormat("vi-VN").format(p.price)} đ</span>
            </div>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

// ─── Quick Prompts ────────────────────────────────────────────────────────────

const QUICK_PROMPTS = [
  { icon: "📊", label: "Báo cáo hôm nay", prompt: "Tạo báo cáo tổng hợp cho hôm nay" },
  { icon: "🛒", label: "Đơn chờ xử lý", prompt: "Có bao nhiêu đơn hàng đang chờ xử lý? Liệt kê chi tiết" },
  { icon: "📦", label: "Tình trạng kho", prompt: "Tóm tắt tình trạng kho hàng, sản phẩm nào sắp hết?" },
  { icon: "🔧", label: "Phiếu sửa chữa", prompt: "Liệt kê các phiếu sửa chữa đang mở" },
  { icon: "👥", label: "Khách hàng VIP", prompt: "Tìm 10 khách hàng có chi tiêu cao nhất" },
  { icon: "⚡", label: "Xử lý tất cả", prompt: "Chuyển tất cả đơn hàng 'pending' sang 'processing' và ước tính thời gian giao" },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminCopilot() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [uploadFileName, setUploadFileName] = useState("");

  const [width, setWidth] = useState(340);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 250 && newWidth <= 800) {
        setWidth(newWidth);
      }
    };
    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
      }
    };

    if (isDragging) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput, append } = useChat({
    api: "/api/chat/admin",
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadStatus("uploading");
    setUploadFileName(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/import", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setUploadStatus("error");
        return;
      }

      setUploadStatus("done");
      // Auto-append a message to trigger the import tool
      await append({
        role: "user",
        content: `Tôi vừa upload file Excel "${file.name}" gồm ${data.totalRows} dòng. Hãy nhập toàn bộ vào hệ thống:\n\n${JSON.stringify(data.rows)}`,
      });
    } catch {
      setUploadStatus("error");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [append]);

  const sendQuickPrompt = useCallback((prompt: string) => {
    append({ role: "user", content: prompt });
  }, [append]);

  return (
    <>
      {/* Expand button when collapsed */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="fixed top-1/2 right-0 -translate-y-1/2 bg-[var(--surface-2)] border border-[var(--border)] border-r-0 rounded-l-xl p-2 text-[var(--primary)] hover:bg-[var(--surface-3)] transition-colors z-[100] shadow-lg"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      <div 
        className="copilot-panel" 
        style={{ 
          width: isCollapsed ? 0 : `${width}px`, 
          borderLeftWidth: isCollapsed ? 0 : 1,
          opacity: isCollapsed ? 0 : 1,
          visibility: isCollapsed ? "hidden" : "visible",
          transition: isDragging ? "none" : "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease",
        }}
      >
        {/* Resize Handle */}
        <div 
          className="absolute -left-1.5 top-0 bottom-0 w-3 cursor-col-resize hover:bg-[var(--primary)]/30 active:bg-[var(--primary)]/50 z-[100] transition-colors"
          onMouseDown={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
        />

        {/* Header */}
        <div className="copilot-header pl-4 relative z-0">
          <div className="flex items-center gap-2.5">
          <div className="copilot-avatar">
            <Sparkles size={18} />
          </div>
          <div>
            <h2 className="font-bold text-[var(--text)] text-sm leading-tight">AI Copilot</h2>
            <p className="text-[10px] text-[var(--primary)] font-medium">GPT-4o · Toàn quyền Admin</p>
          </div>
        </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] text-green-400 font-semibold">Live</span>
            </span>
            <button 
              onClick={() => setIsCollapsed(true)}
              className="p-1 hover:bg-white/10 rounded-md text-[var(--text-muted)] hover:text-white transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      {/* Messages */}
      <div className="copilot-messages">
        {messages.length === 0 && (
          <div className="flex flex-col items-center text-center px-3 py-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center mb-3 shadow-lg">
              <Sparkles size={22} className="text-white" />
            </div>
            <h3 className="text-sm font-bold text-[var(--text)] mb-1">Xin chào Admin!</h3>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed mb-4">
              Tôi có toàn quyền quản lý: đơn hàng, sản phẩm, kho, sửa chữa, khách hàng & báo cáo.
            </p>
            <div className="grid grid-cols-2 gap-1.5 w-full">
              {QUICK_PROMPTS.map((qp) => (
                <button
                  key={qp.prompt}
                  onClick={() => sendQuickPrompt(qp.prompt)}
                  className="text-[10px] px-2 py-2 rounded-lg border border-white/8 bg-white/3 hover:bg-white/8 hover:border-[var(--primary)]/40 text-left transition-all flex items-center gap-1.5 group"
                >
                  <span>{qp.icon}</span>
                  <span className="text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors">{qp.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={"flex gap-2 " + (m.role === "user" ? "flex-row-reverse" : "")}>
            {m.role !== "user" && (
              <div className="w-7 h-7 rounded-full bg-[rgba(183,148,244,0.15)] border border-[rgba(183,148,244,0.3)] flex items-center justify-center text-[var(--primary)] flex-shrink-0 mt-1">
                <Bot size={14} />
              </div>
            )}
            <div className={"flex flex-col gap-1.5 max-w-[90%] " + (m.role === "user" ? "items-end" : "items-start")}>
              {m.content && (
                <div className={"px-3 py-2.5 rounded-2xl text-xs leading-relaxed " + (
                  m.role === "user"
                    ? "bg-[var(--primary)] text-white rounded-tr-sm"
                    : "bg-[var(--surface-2)] text-[var(--text)] rounded-tl-sm border border-white/5"
                )}>
                  {m.role === "assistant" ? (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                        strong: ({ children }) => <strong className="font-bold text-[var(--primary)]">{children}</strong>,
                        ul: ({ children }) => <ul className="list-disc list-inside space-y-0.5 pl-1">{children}</ul>,
                        li: ({ children }) => <li className="text-[var(--text-muted)]">{children}</li>,
                        code: ({ children }) => <code className="bg-white/10 px-1 rounded font-mono text-[10px]">{children}</code>,
                      }}
                    >
                      {m.content}
                    </ReactMarkdown>
                  ) : m.content}
                </div>
              )}
              {/* Tool invocations */}
              {m.toolInvocations?.map((toolInv) => {
                if (toolInv.state !== "result") {
                  return (
                    <div key={toolInv.toolCallId} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[rgba(11,197,234,0.08)] border border-[rgba(11,197,234,0.2)] text-[var(--accent)] text-[10px] italic">
                      <Loader2 size={12} className="animate-spin" />
                      Đang chạy <code className="font-mono">{toolInv.toolName}</code>…
                    </div>
                  );
                }
                return (
                  <ToolResult key={toolInv.toolCallId} toolName={toolInv.toolName} result={toolInv.result} />
                );
              })}
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-[rgba(183,148,244,0.15)] border border-[rgba(183,148,244,0.3)] flex items-center justify-center text-[var(--primary)] flex-shrink-0">
              <Bot size={14} />
            </div>
            <div className="bg-[var(--surface-2)] border border-white/5 px-3 py-2.5 rounded-2xl rounded-tl-sm flex items-center gap-1">
              <span className="dot" /><span className="dot" /><span className="dot" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Upload Status Banner */}
      {uploadStatus !== "idle" && (
        <div className={`mx-3 mb-2 px-3 py-2 rounded-lg text-[10px] flex items-center justify-between ${
          uploadStatus === "uploading" ? "bg-blue-500/10 border border-blue-500/30 text-blue-400" :
          uploadStatus === "done"      ? "bg-green-500/10 border border-green-500/30 text-green-400" :
                                         "bg-red-500/10 border border-red-500/30 text-red-400"
        }`}>
          <span>
            {uploadStatus === "uploading" && <><Loader2 size={10} className="inline animate-spin mr-1" />Đang xử lý {uploadFileName}…</>}
            {uploadStatus === "done"      && <>✅ Đã nhập "{uploadFileName}"</>}
            {uploadStatus === "error"     && <>❌ Lỗi khi xử lý file</>}
          </span>
          <button onClick={() => setUploadStatus("idle")}><X size={10} /></button>
        </div>
      )}

      {/* Input */}
      <div className="copilot-input-area">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Upload Excel/CSV"
            className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)]/40 hover:bg-[var(--primary)]/10 transition-all"
          >
            <Paperclip size={14} />
          </button>
          <input
            className="flex-1 bg-[rgba(13,17,23,0.5)] border border-[var(--border)] rounded-full pl-3.5 pr-3 py-2.5 text-xs text-[var(--text)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            value={input}
            placeholder="Giao việc cho Copilot…"
            onChange={handleInputChange}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center disabled:bg-[var(--surface-3)] disabled:text-[var(--text-muted)] transition-colors"
          >
            <Send size={13} />
          </button>
        </form>
        <div className="text-center mt-1.5 text-[9px] text-[var(--text-faint)]">
          📎 Hỗ trợ nhập Excel · AI có toàn quyền Admin
        </div>
      </div>
      </div>
    </>
  );
}
