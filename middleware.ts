import { auth } from "@/lib/auth";

export default auth;

export const config = {
  // Protect all routes except static files and NextAuth API routes
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
