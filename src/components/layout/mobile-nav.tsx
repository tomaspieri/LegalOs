"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutGrid, Phone, Settings } from "lucide-react";

const navItems = [
  { href: "/board", label: "Pipeline", icon: LayoutGrid },
  { href: "/communications", label: "Comms", icon: Phone },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-sidebar-bg)] border-t border-white/5 flex md:hidden"
         style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors",
              isActive
                ? "text-white"
                : "text-[var(--color-sidebar-text)] hover:text-white"
            )}
          >
            <Icon size={20} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
