"use client";

import { usePathname } from "next/navigation";
import CustomerChatWidget from "./CustomerChatWidget";

export default function ConditionalChatWidget() {
  const pathname = usePathname();
  // Hide customer chat on all /admin routes — admin has its own AI Copilot
  if (pathname?.startsWith("/admin")) return null;
  return <CustomerChatWidget />;
}
