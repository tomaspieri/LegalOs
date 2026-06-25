import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) redirect("/login");

  const user = {
    name: session.user.name ?? "User",
    email: session.user.email ?? "",
    role: (session.user as any).role ?? "member",
    avatarUrl: session.user.image ?? null,
  };

  return (
    // Use dvh (dynamic viewport height) to handle iOS address bar correctly
    <div className="flex h-[100dvh] bg-[var(--color-bg)]">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar user={user} />
      </div>

      {/* Main content — scrolls independently, padded for mobile nav + safe area */}
      <main
        className="flex-1 min-w-0 overflow-y-auto md:pb-0"
        style={{ paddingBottom: "calc(4rem + env(safe-area-inset-bottom, 0px))" }}
      >
        {children}
      </main>

      {/* Mobile bottom nav — fixed, hidden on desktop */}
      <MobileNav />
    </div>
  );
}
