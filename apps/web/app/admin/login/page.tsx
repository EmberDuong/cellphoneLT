import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Đăng nhập Admin",
};

export default function AdminLoginPage() {
  return <LoginForm />;
}
