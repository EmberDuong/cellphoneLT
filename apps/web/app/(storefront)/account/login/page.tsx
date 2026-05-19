"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Smartphone, Eye, EyeOff, AlertCircle, LogIn } from "lucide-react";

export default function CustomerLoginPage() {
  const router = useRouter();
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("customer-credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Email hoặc mật khẩu không chính xác.");
      setLoading(false);
    } else {
      router.push("/account");
      router.refresh();
    }
  }

  return (
    <div className="auth-page" style={{ position: "relative" }}>
      {/* Background glow blobs */}
      <div style={{
        position: "absolute", top: "10%", left: "5%",
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(183,148,244,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "10%", right: "5%",
        width: 350, height: 350, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(11,197,234,0.1) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">
            <Smartphone size={22} style={{ color: "var(--primary)" }} />
            <span className="logo-text">
              cellphone<span className="logo-accent">LT</span>
            </span>
          </div>
          <h1 className="auth-title">Chào mừng trở lại!</h1>
          <p className="auth-subtitle">Đăng nhập để xem đơn hàng và ưu đãi của bạn</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Error message */}
          {error && (
            <motion.div
              className="auth-error"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <AlertCircle size={15} /> {error}
            </motion.div>
          )}

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="customer-email">Email</label>
            <input
              id="customer-email"
              type="email"
              className="form-input"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="customer-password">Mật khẩu</label>
            <div style={{ position: "relative" }}>
              <input
                id="customer-password"
                type={showPass ? "text" : "password"}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{ paddingRight: "2.75rem" }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                aria-label={showPass ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                style={{
                  position: "absolute", right: "0.75rem", top: "50%",
                  transform: "translateY(-50%)",
                  background: "none", border: "none",
                  color: "var(--text-muted)", cursor: "pointer",
                  display: "flex", alignItems: "center",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            id="customer-login-btn"
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: "100%", marginTop: "0.5rem", justifyContent: "center" }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" style={{ animation: "spin 0.8s linear infinite" }}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="32" strokeLinecap="round" />
                </svg>
                Đang đăng nhập...
              </span>
            ) : (
              <><LogIn size={16} /> Đăng nhập</>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Chưa có tài khoản?{" "}
            <Link href="/account/register" className="auth-link">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </motion.div>

      {/* Spin animation for loading spinner */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
