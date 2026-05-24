import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import ConditionalChatWidget from "@/components/ConditionalChatWidget";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: {
    template: "%s | CellphoneLT",
    default: "CellphoneLT — Phụ kiện, sửa chữa & thu mua điện thoại",
  },
  description:
    "Mua phụ kiện điện thoại chính hãng, đặt lịch sửa chữa và nhận báo giá thu mua máy cũ ngay lập tức.",
  metadataBase: new URL(
    process.env.NEXTAUTH_URL ?? "http://localhost:3000"
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <SessionProvider>
          {children}
          {/* Only show customer chat on storefront, not on /admin routes */}
          <ConditionalChatWidget />
        </SessionProvider>
      </body>
    </html>
  );
}
