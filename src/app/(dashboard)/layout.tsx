import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

// Preview user for development — REMOVE before production
const DEV_PREVIEW_USER = process.env.NODE_ENV === "development"
  ? { name: "Robert Hayes", email: "robert@hayeslawfirm.com", role: "admin", avatarUrl: null }
  : null;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  const user = session?.user
    ? {
        name: session.user.name ?? "User",
        email: session.user.email ?? "",
        role: (session.user as any).role ?? "member",
        avatarUrl: session.user.image ?? null,
      }
    : DEV_PREVIEW_USER;

  if (!user) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg)]">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar user={user} />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto pb-16 md:pb-0">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}
