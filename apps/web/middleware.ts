import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Protect all routes starting with /admin
  matcher: ["/admin/:path*"],
};
