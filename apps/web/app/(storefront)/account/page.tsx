import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/lib/auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tài khoản của tôi | CellphoneLT",
};

export default async function AccountPage() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "customer") {
    redirect("/account/login");
  }

  const user = session.user!;

  return (
    <main className="section-inner" style={{ padding: "3rem 1.5rem", maxWidth: 800 }}>
      {/* Welcome Header */}
      <div className="account-hero">
        <div className="account-avatar">
          {user.name?.charAt(0).toUpperCase() || "K"}
        </div>
        <div>
          <h1 className="account-name">Xin chào, {user.name?.split(" ").pop()}! 👋</h1>
          <p className="account-email">{user.email}</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="account-cards">
        <Link href="/account/orders" className="account-card">
          <div className="account-card-icon">📦</div>
          <div>
            <div className="account-card-title">Đơn hàng của tôi</div>
            <div className="account-card-desc">Xem lịch sử và trạng thái đơn hàng</div>
          </div>
          <span className="account-card-arrow">→</span>
        </Link>

        <Link href="/products" className="account-card">
          <div className="account-card-icon">🛍️</div>
          <div>
            <div className="account-card-title">Tiếp tục mua sắm</div>
            <div className="account-card-desc">Khám phá phụ kiện mới nhất</div>
          </div>
          <span className="account-card-arrow">→</span>
        </Link>

        <Link href="/repair" className="account-card">
          <div className="account-card-icon">🔧</div>
          <div>
            <div className="account-card-title">Đặt lịch sửa chữa</div>
            <div className="account-card-desc">Sửa nhanh, bảo hành uy tín</div>
          </div>
          <span className="account-card-arrow">→</span>
        </Link>

        <Link href="/trade-in" className="account-card">
          <div className="account-card-icon">💰</div>
          <div>
            <div className="account-card-title">Thu mua máy cũ</div>
            <div className="account-card-desc">Nhận báo giá tức thì</div>
          </div>
          <span className="account-card-arrow">→</span>
        </Link>
      </div>

      {/* Sign Out */}
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <button
          type="submit"
          className="btn-outline"
          style={{ marginTop: "2rem", fontSize: "0.9rem", padding: "0.6rem 1.5rem" }}
        >
          Đăng xuất
        </button>
      </form>
    </main>
  );
}
