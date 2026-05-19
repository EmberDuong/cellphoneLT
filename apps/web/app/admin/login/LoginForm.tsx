"use client";

import { useActionState } from "react";
import { authenticateStaff } from "./actions";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(authenticateStaff, undefined);
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--background)" }}>
        <div style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Đang tải trạng thái...</div>
      </div>
    );
  }

  if (session?.user) {
    const isStaff = (session.user as any).role === "staff";

    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--background)" }}>
        <div className="card" style={{ width: "100%", maxWidth: 400, padding: "2rem", background: "var(--card-bg, #fff)", borderRadius: "12px", border: "1px solid var(--border-color, #eaeaea)", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Tài khoản đang đăng nhập</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              Bạn đang đăng nhập bằng tài khoản:
            </p>
            <div style={{ margin: "1rem 0", padding: "0.75rem", background: "var(--surface-2)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
              <div style={{ fontWeight: 600 }}>{session.user.name || session.user.email}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 600, marginTop: "0.25rem", textTransform: "uppercase" }}>
                Vai trò: {isStaff ? "Quản trị viên (Staff)" : "Khách hàng (Customer)"}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {isStaff ? (
              <Link href="/admin/dashboard" className="btn-primary" style={{ textAlign: "center", textDecoration: "none", display: "block" }}>
                Đi tới Dashboard
              </Link>
            ) : (
              <div style={{ fontSize: "0.85rem", color: "var(--warning)", background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)", padding: "0.75rem", borderRadius: "var(--radius-sm)", marginBottom: "0.5rem", textAlign: "center" }}>
                Tài khoản khách hàng không thể vào trang quản trị. Vui lòng đăng xuất để đăng nhập tài khoản Admin.
              </div>
            )}

            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="btn-outline"
              style={{ width: "100%", padding: "0.8rem", color: "var(--danger)", borderColor: "var(--danger)", cursor: "pointer" }}
            >
              Đăng xuất
            </button>

            <Link href="/" style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", textDecoration: "none", marginTop: "0.5rem" }}>
              Quay lại Trang chủ Cửa hàng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--background)" }}>
      <div className="card" style={{ width: "100%", maxWidth: 400, padding: "2rem", background: "var(--card-bg, #fff)", borderRadius: "12px", border: "1px solid var(--border-color, #eaeaea)", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Đăng nhập quản trị</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Vui lòng đăng nhập để truy cập Admin Panel</p>
        </div>

        <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>Email</label>
            <input 
              type="email" 
              name="email" 
              className="form-input" 
              style={{ width: "100%" }} 
              placeholder="admin@cellphonelt.com" 
              required 
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>Mật khẩu</label>
            <input 
              type="password" 
              name="password" 
              className="form-input" 
              style={{ width: "100%" }} 
              placeholder="••••••••" 
              required 
            />
          </div>

          {state && (
            <div style={{ padding: "0.75rem", background: "#fee2e2", color: "#b91c1c", borderRadius: "0.375rem", fontSize: "0.875rem" }}>
              {state}
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ width: "100%", padding: "0.8rem", marginTop: "1rem" }} disabled={isPending}>
            {isPending ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.5rem", borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
          <Link href="/" style={{ fontSize: "0.85rem", color: "var(--text-muted)", textDecoration: "none" }}>
            ← Quay lại Trang chủ Cửa hàng
          </Link>
        </div>
      </div>
    </div>
  );
}
