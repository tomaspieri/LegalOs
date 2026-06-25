import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decode } from "@auth/core/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isOnLogin = pathname.startsWith("/login");

  const secret = process.env.NEXTAUTH_SECRET;
  const cookieName = process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

  const token = req.cookies.get(cookieName)?.value;

  let isLoggedIn = false;
  if (token && secret) {
    try {
      const decoded = await decode({ token, secret, salt: cookieName });
      isLoggedIn = !!decoded;
    } catch {
      isLoggedIn = false;
    }
  }

  if (isOnLogin) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/board", req.url));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
