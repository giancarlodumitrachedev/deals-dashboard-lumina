"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/types/domain";
import { UI } from "@/lib/i18n/it";

interface NavItem {
  href: string;
  label: string;
}

const NAV: Record<UserRole, NavItem[]> = {
  admin: [
    { href: "/admin", label: UI.nav.operativita },
    { href: "/admin/deals", label: "Deal" },
    { href: "/admin/users", label: "Utenti" },
    { href: "/admin/analytics", label: UI.nav.analitiche },
    { href: "/admin/commissions", label: UI.nav.commissioni },
  ],
  manager: [
    { href: "/manager", label: "Nuovi Lead" },
  ],
  developer: [{ href: "/developer", label: "In Sviluppo" }],
  sales: [{ href: "/sales", label: "Pipeline" }],
};

export function Sidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const items = NAV[role];

  return (
    <aside className="hidden w-56 shrink-0 border-r border-line bg-surface lg:flex lg:flex-col">
      <div className="border-b border-line px-5 py-4">
        <div className="text-xs uppercase tracking-widest text-faint">Lumina</div>
        <div className="text-sm font-semibold text-primary">{UI.appName}</div>
      </div>
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-0.5">
          {items.map((it) => {
            const active = pathname === it.href || pathname.startsWith(it.href + "/");
            return (
              <li key={it.href}>
                <Link
                  href={it.href}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-surface-2 font-medium text-primary"
                      : "text-muted hover:bg-surface-2 hover:text-primary",
                  )}
                >
                  {it.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
