"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import AdminCopilot from "@/components/AdminCopilot";

export function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="admin-layout">
      {/* Left: navigation sidebar */}
      <AdminSidebar />

      {/* Center: page content */}
      <div className="admin-main admin-main--with-copilot">
        {children}
      </div>

      {/* Right: always-visible AI Copilot panel */}
      <AdminCopilot />
    </div>
  );
}
