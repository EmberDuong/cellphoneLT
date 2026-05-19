import { type NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = (auth?.user as any)?.role;
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      const isAccountRoute = nextUrl.pathname.startsWith("/account");
      const isLoginRoute = nextUrl.pathname === "/admin/login";
      const isAccountLoginRoute = nextUrl.pathname === "/account/login";
      const isAccountRegisterRoute = nextUrl.pathname === "/account/register";

      // ── Admin routes ─────────────────────────────────────────
      if (isAdminRoute) {
        if (isLoginRoute) {
          if (isLoggedIn && role === "staff")
            return Response.redirect(new URL("/admin/dashboard", nextUrl));
          return true;
        }
        if (isLoggedIn && role === "staff") return true;
        return false; // redirects to pages.signIn = /admin/login
      }

      // ── Customer account routes ───────────────────────────────
      if (isAccountRoute) {
        if (isAccountLoginRoute || isAccountRegisterRoute) {
          if (isLoggedIn && role === "customer")
            return Response.redirect(new URL("/account", nextUrl));
          return true;
        }
        if (isLoggedIn && role === "customer") return true;
        // Redirect unauthenticated to customer login
        return Response.redirect(new URL("/account/login", nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  providers: [], // Add your providers here in auth.ts
} satisfies NextAuthConfig;

