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
    { href: "/admin/reports", label: "Segnalazioni" },
    { href: "/profile", label: "Profilo" },
  ],
  manager: [
    { href: "/manager", label: "Nuovi Lead" },
    { href: "/me/analytics", label: UI.nav.analitiche },
    { href: "/profile", label: "Profilo" },
  ],
  developer: [
    { href: "/developer", label: "In Sviluppo" },
    { href: "/me/analytics", label: UI.nav.analitiche },
    { href: "/profile", label: "Profilo" },
  ],
  sales: [
    { href: "/sales", label: "Pipeline" },
    { href: "/sales/commissions", label: UI.nav.commissioni },
    { href: "/me/analytics", label: UI.nav.analitiche },
    { href: "/profile", label: "Profilo" },
  ],
};

export function Sidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const items = NAV[role];

  // Pick the single best-matching item (longest prefix), so highlighting
  // never gets "stuck" on a shorter parent path like /admin when on /admin/users.
  const activeHref =
    items
      .filter((i) => pathname === i.href || pathname.startsWith(i.href + "/"))
      .sort((a, b) => b.href.length - a.href.length)[0]?.href ?? "";

  return (
    <aside className="hidden w-56 shrink-0 border-r border-line bg-surface lg:flex lg:flex-col">
      <div className="border-b border-line px-5 py-4">
        <div className="text-xs uppercase tracking-widest text-faint">Lumina</div>
        <div className="text-sm font-semibold text-primary">{UI.appName}</div>
      </div>
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-0.5">
          {items.map((it) => {
            const active = it.href === activeHref;
            return (
              <li key={it.href}>
                <Link
                  prefetch={false}
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
