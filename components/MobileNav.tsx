"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/types/domain";
import { UI } from "@/lib/i18n/it";
import { NAV, activeNavHref } from "@/lib/nav";

export function MobileNav({ role }: { role: UserRole }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const items = NAV[role];
  const activeHref = activeNavHref(items, pathname);

  // Close drawer on navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(true)}
        aria-label="Apri menu"
        className="flex h-8 w-8 items-center justify-center rounded-md border border-line bg-surface text-primary hover:bg-surface-2"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-surface transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-faint">Lumina</div>
            <div className="text-sm font-semibold text-primary">{UI.appName}</div>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Chiudi menu"
            className="text-faint hover:text-primary"
          >
            ✕
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-0.5">
            {items.map((it) => {
              const active = it.href === activeHref;
              return (
                <li key={it.href}>
                  <Link
                    prefetch={false}
                    href={it.href}
                    className={cn(
                      "flex items-center rounded-md px-3 py-2.5 text-sm transition-colors",
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
    </div>
  );
}
