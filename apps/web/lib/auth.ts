import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@cellphonelt/db";
import { staff } from "@cellphonelt/db/schema/lookup";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mật khẩu", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        // Find staff by email
        const user = await db.query.staff.findFirst({
          where: eq(staff.email, credentials.email as string),
        });

        if (!user || !user.isActive) return null;

        // Verify password
        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!passwordMatch) return null;

        return {
          id: user.id,
          name: user.fullName,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
});
