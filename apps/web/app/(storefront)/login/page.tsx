"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@cellphonelt.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Email hoặc mật khẩu không chính xác.");
      setLoading(false);
    } else {
      router.push("/admin/dashboard");
      router.refresh();
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div style={{ width: "100%", maxWidth: 400, padding: "2rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div className="logo-text" style={{ fontSize: "1.5rem" }}>
            cellphone<span className="logo-accent">LT</span>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.5rem" }}>
            Đăng nhập hệ thống quản trị
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {error && (
             <div style={{ padding: "0.75rem", background: "rgba(239, 68, 68, 0.15)", color: "var(--danger)", borderRadius: "var(--radius-sm)", fontSize: "0.85rem", textAlign: "center" }}>
               {error}
             </div>
          )}
          
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-input" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <input 
              type="password" 
              className="form-input" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: "1rem" }}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}
