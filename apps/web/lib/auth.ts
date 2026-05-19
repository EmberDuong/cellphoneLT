import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db, eq, staff, customers } from "@cellphonelt/db";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    // ── Staff / Admin login ──────────────────────────────────
    Credentials({
      id: "staff-credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mật khẩu", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.query.staff.findFirst({
          where: eq(staff.email, credentials.email as string),
        });

        if (!user || !user.isActive) return null;

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!passwordMatch) return null;

        return {
          id: user.id,
          name: user.fullName,
          email: user.email,
          role: "staff",
        };
      },
    }),

    // ── Customer / Storefront login ──────────────────────────
    Credentials({
      id: "customer-credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mật khẩu", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const customer = await db.query.customers.findFirst({
          where: eq(customers.email, credentials.email as string),
        });

        if (!customer || !customer.passwordHash) return null;

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          customer.passwordHash
        );

        if (!passwordMatch) return null;

        return {
          id: customer.id,
          name: customer.fullName,
          email: customer.email,
          role: "customer",
        };
      },
    }),
  ],
});

