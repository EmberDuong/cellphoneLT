"use server";

import { db, eq, customers } from "@cellphonelt/db";
import bcrypt from "bcryptjs";
import { signIn } from "@/lib/auth";


interface RegisterResult {
  success: boolean;
  error?: string;
}

export async function registerCustomer(formData: FormData): Promise<RegisterResult> {
  const fullName = (formData.get("fullName") as string)?.trim();
  const phoneNumber = (formData.get("phoneNumber") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!fullName || !email || !password) {
    return { success: false, error: "Vui lòng điền đầy đủ thông tin." };
  }

  if (password.length < 6) {
    return { success: false, error: "Mật khẩu phải có ít nhất 6 ký tự." };
  }

  // Check if email already registered
  const existing = await db.query.customers.findFirst({
    where: eq(customers.email, email),
  });

  if (existing) {
    return { success: false, error: "Email này đã được đăng ký. Vui lòng đăng nhập." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await (db.insert(customers) as any).values({
    fullName,
    phoneNumber: phoneNumber || null,
    email,
    passwordHash,
    emailVerified: false,
  });

  // Auto sign-in after registration
  try {
    await signIn("customer-credentials", {
      email,
      password,
      redirect: false,
    });
  } catch (err: any) {
    // Fix #11 — Only swallow NEXT_REDIRECT (expected Next.js behaviour).
    // Log any other sign-in errors so they're not silently lost.
    if (!err?.digest?.startsWith("NEXT_REDIRECT") && !err?.message?.includes("NEXT_REDIRECT")) {
      console.error("Auto sign-in after registration failed:", err);
    }
  }

  return { success: true };
}
