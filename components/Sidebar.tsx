"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/types/domain";
import { UI } from "@/lib/i18n/it";
import { NAV, activeNavHref } from "@/lib/nav";

export function Sidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const items = NAV[role];
  const activeHref = activeNavHref(items, pathname);

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
