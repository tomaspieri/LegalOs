import type { NextAuthConfig } from "next-auth";

// Lightweight config for the Edge middleware — no DB, no bcrypt.
// Only used to verify JWT sessions via the authorized callback.
export const edgeAuthConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAuthPage = nextUrl.pathname.startsWith("/login");

      if (isOnAuthPage) {
        if (isLoggedIn) return Response.redirect(new URL("/board", nextUrl));
        return true;
      }

      if (!isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      return true;
    },
  },
  providers: [],
  session: { strategy: "jwt" },
  trustHost: true,
};
