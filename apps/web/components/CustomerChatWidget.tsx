"use client";

import { useChat } from "ai/react";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Loader2, CheckCircle, XCircle, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CustomerChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat/customer",
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={"chat-widget-fab " + (isOpen ? "hidden" : "flex")}
        aria-label="Open chat"
      >
        <MessageCircle size={28} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="chat-widget-panel"
          >
            {/* Header */}
            <div className="chat-widget-header">
              <div className="flex items-center gap-3">
                <div className="chat-widget-avatar">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">CellphoneLT Assistant</h3>
                  <p className="text-xs text-[var(--text-faint)]">Online • Sẵn sàng hỗ trợ</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="chat-widget-close">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="chat-widget-messages">
              {messages.length === 0 && (
                <div className="chat-empty-state">
                  <Bot size={32} className="text-[var(--primary)] mb-2" />
                  <p className="font-medium mb-1">Xin chào! Mình có thể giúp gì cho bạn?</p>
                  <p className="text-xs text-[var(--text-faint)]">Hỏi mình về sản phẩm, đặt hàng, hoặc tình trạng đơn hàng của bạn nhé.</p>
                </div>
              )}

              {messages.map((m) => (
                <div key={m.id} className={"chat-msg-row " + (m.role === "user" ? "chat-msg-row--user" : "")}>
                  {m.role !== "user" && (
                    <div className="chat-msg-avatar"><Bot size={16} /></div>
                  )}
                  <div className={"chat-msg-bubble " + (m.role === "user" ? "chat-msg-bubble--user" : "")}>
                    {m.content}

                    {m.toolInvocations?.map((tool) => {
                      const id = tool.toolCallId;

                      if (tool.state !== "result") {
                        return (
                          <div key={id} className="flex items-center gap-2 mt-2 text-xs text-[var(--text-faint)] italic">
                            <Loader2 size={12} className="animate-spin" />
                            {tool.toolName === "placeOrder" ? "Đang xử lý đơn hàng..." :
                             tool.toolName === "searchProducts" ? "Đang tìm kiếm sản phẩm..." :
                             "Đang xử lý..."}
                          </div>
                        );
                      }

                      /* --- searchProducts result --- */
                      if (tool.toolName === "searchProducts") {
                        const results = tool.result;
                        if (!results || results.length === 0) {
                          return (
                            <div key={id} className="mt-3 text-xs text-[var(--text-faint)] italic">
                              Không tìm thấy sản phẩm phù hợp.
                            </div>
                          );
                        }
                        return (
                          <div key={id} className="mt-3 space-y-2 border-t border-[rgba(255,255,255,0.1)] pt-3">
                            <p className="text-xs font-semibold text-[var(--primary)] uppercase">
                              🔍 Đã tìm thấy {results.length} sản phẩm
                            </p>
                            <div className="flex flex-col gap-2">
                              {results.map((product: any) => (
                                <a key={product.id} href={product.url} target="_blank" className="chat-product-card">
                                  <div className="font-semibold text-sm text-[var(--text)]">{product.name}</div>
                                  <div className="text-xs text-[var(--text-muted)] flex justify-between mt-1">
                                    <span>{product.brand} • {product.inStock ? "Còn hàng" : "Hết hàng"}</span>
                                    <span className="font-medium text-[var(--success)]">
                                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.price)}
                                    </span>
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        );
                      }

                      /* --- placeOrder result --- */
                      if (tool.toolName === "placeOrder") {
                        const res = tool.result;
                        if (res.success) {
                          return (
                            <div key={id} className="mt-3 p-3 rounded-xl bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)]">
                              <div className="flex items-center gap-2 text-[var(--success)] font-semibold text-sm mb-2">
                                <CheckCircle size={16} />
                                Đặt hàng thành công!
                              </div>
                              <div className="text-xs text-[var(--text-muted)] space-y-1">
                                <div>🆔 Mã đơn: <span className="font-mono text-[var(--text)]">{res.orderId?.slice(0, 8).toUpperCase()}</span></div>
                                <div>📦 Sản phẩm: {res.productName}</div>
                                <div>💰 Tổng tiền: {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(res.totalAmount)}</div>
                                <div>📧 Email xác nhận đã được gửi.</div>
                              </div>
                            </div>
                          );
                        } else {
                          return (
                            <div key={id} className="mt-3 p-3 rounded-xl bg-[rgba(244,63,94,0.1)] border border-[rgba(244,63,94,0.3)]">
                              <div className="flex items-center gap-2 text-[var(--danger)] font-semibold text-sm mb-1">
                                <XCircle size={16} />
                                Không thể đặt hàng
                              </div>
                              <div className="text-xs text-[var(--text-muted)]">{res.reason}</div>
                            </div>
                          );
                        }
                      }

                      return null;
                    })}
                  </div>
                </div>
              ))}

              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="chat-msg-row">
                  <div className="chat-msg-avatar"><Bot size={16} /></div>
                  <div className="chat-msg-bubble chat-msg-bubble--typing">
                    <span className="dot"></span><span className="dot"></span><span className="dot"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="chat-widget-input-area">
              <input
                className="chat-widget-input"
                value={input}
                placeholder="Nhập câu hỏi hoặc yêu cầu đặt hàng..."
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <button type="submit" disabled={isLoading || !input.trim()} className="chat-widget-send">
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
