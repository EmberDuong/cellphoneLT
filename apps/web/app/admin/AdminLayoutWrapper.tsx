"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        {children}
      </div>
    </div>
  );
}
