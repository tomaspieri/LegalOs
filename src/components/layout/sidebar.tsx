"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import {
  LayoutGrid,
  Phone,
  Settings,
  Scale,
  LogOut,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { href: "/board", label: "Pipeline", icon: LayoutGrid },
  { href: "/communications", label: "Communications", icon: Phone },
];

const bottomItems: NavItem[] = [
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  user: {
    name: string;
    email: string;
    role: string;
    avatarUrl?: string | null;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-56 h-full bg-[var(--color-sidebar-bg)] flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/5">
        <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-[var(--color-accent)] flex items-center justify-center flex-shrink-0">
          <Scale size={15} className="text-white" />
        </div>
        <span className="text-white font-semibold text-sm tracking-tight">
          LegalOS
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-3 flex flex-col gap-0.5">
        {bottomItems.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}

        {/* User */}
        <div className="mt-2 pt-3 border-t border-white/5">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-[var(--radius-md)]">
            <Avatar
              name={user.name}
              src={user.avatarUrl}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[var(--color-sidebar-text-active)] truncate">
                {user.name}
              </p>
              <p className="text-xs text-[var(--color-sidebar-text)] truncate capitalize">
                {user.role}
              </p>
            </div>
          </div>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-2 py-2 rounded-[var(--radius-md)] text-xs text-[var(--color-sidebar-text)] hover:text-[var(--color-sidebar-text-active)] hover:bg-[var(--color-sidebar-hover)] transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const Icon = item.icon;
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-2.5 px-2 py-2 rounded-[var(--radius-md)] text-sm transition-colors",
        isActive
          ? "bg-[var(--color-sidebar-active)] text-[var(--color-sidebar-text-active)]"
          : "text-[var(--color-sidebar-text)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-sidebar-text-active)]"
      )}
    >
      <Icon size={16} className="flex-shrink-0" />
      {item.label}
    </Link>
  );
}
