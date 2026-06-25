import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authConfig: NextAuthConfig = {
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.lawFirmId = (user as any).lawFirmId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
        (session.user as any).lawFirmId = token.lawFirmId;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      async authorize(rawCredentials) {
        const parsed = loginSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const { getSupabaseAdmin } = await import("@/lib/supabase-server");
        const supabase = getSupabaseAdmin();

        const { data: users } = await (supabase as any)
          .from("users")
          .select("id, name, email, avatar_url, role, law_firm_id, password_hash")
          .eq("email", email.toLowerCase().trim())
          .limit(1);

        const user = users?.[0] as any;
        if (!user || !user.password_hash) return null;

        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.avatar_url,
          role: user.role,
          lawFirmId: user.law_firm_id,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  trustHost: true,
};
