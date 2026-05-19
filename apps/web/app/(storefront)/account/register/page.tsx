"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerCustomer } from "../actions";

export default function CustomerRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      setLoading(false);
      return;
    }

    const result = await registerCustomer(formData);

    if (!result.success) {
      setError(result.error || "Đã có lỗi xảy ra. Vui lòng thử lại.");
      setLoading(false);
      return;
    }

    // Sign in immediately after successful registration
    const email = formData.get("email") as string;
    await signIn("customer-credentials", {
      email,
      password,
      redirect: false,
    });

    router.push("/account");
    router.refresh();
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">
            <span className="logo-icon">📱</span>
            <span className="logo-text">
              cellphone<span className="logo-accent">LT</span>
            </span>
          </div>
          <h1 className="auth-title">Tạo tài khoản</h1>
          <p className="auth-subtitle">Đăng ký để theo dõi đơn hàng và nhận ưu đãi</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Họ và tên</label>
            <input
              id="register-name"
              name="fullName"
              type="text"
              className="form-input"
              placeholder="Nguyễn Văn A"
              required
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Số điện thoại</label>
            <input
              id="register-phone"
              name="phoneNumber"
              type="tel"
              className="form-input"
              placeholder="0912 345 678"
              autoComplete="tel"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              id="register-email"
              name="email"
              type="email"
              className="form-input"
              placeholder="email@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <input
              id="register-password"
              name="password"
              type="password"
              className="form-input"
              placeholder="Ít nhất 6 ký tự"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Xác nhận mật khẩu</label>
            <input
              id="register-confirm-password"
              name="confirmPassword"
              type="password"
              className="form-input"
              placeholder="Nhập lại mật khẩu"
              required
              autoComplete="new-password"
            />
          </div>

          <button
            id="register-submit-btn"
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: "100%", marginTop: "0.5rem" }}
          >
            {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Đã có tài khoản?{" "}
            <Link href="/account/login" className="auth-link">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
