"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function authenticateStaff(prevState: string | undefined, formData: FormData) {
  try {
    await signIn("staff-credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Email hoặc mật khẩu không chính xác.";
        default:
          return "Đã xảy ra lỗi. Vui lòng thử lại.";
      }
    }
    throw error;
  }
}
