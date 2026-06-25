import NextAuth from "next-auth";
import { edgeAuthConfig } from "@/lib/auth/edge-config";

export default NextAuth(edgeAuthConfig).auth;

export const config = {
  // Protect all routes except static files and NextAuth API routes
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
