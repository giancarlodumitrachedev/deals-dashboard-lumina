"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/types/domain";
import { ROLE_LABEL, UI } from "@/lib/i18n/it";
import { NAV, activeNavHref } from "@/lib/nav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { logout } from "@/app/login/actions";

export function MobileNav({
  role,
  fullName,
}: {
  role: UserRole;
  fullName: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const items = NAV[role];
  const activeHref = activeNavHref(items, pathname);

  useEffect(() => setMounted(true), []);

  // Close on navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(true)}
        aria-label="Apri menu"
        className="flex h-9 w-9 items-center justify-center rounded-md border border-line bg-surface text-primary transition-colors hover:bg-surface-2"
      >
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
          <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {mounted &&
        createPortal(
          <>
            {/* Overlay */}
            <div
              className={cn(
                "fixed inset-0 z-[60] bg-black/50 transition-opacity duration-200 lg:hidden",
                open ? "opacity-100" : "pointer-events-none opacity-0",
              )}
              onClick={() => setOpen(false)}
            />

            {/* Drawer */}
            <aside
              className={cn(
                "fixed inset-y-0 left-0 z-[70] flex w-[82%] max-w-xs flex-col bg-surface shadow-2xl transition-transform duration-200 ease-out lg:hidden",
                open ? "translate-x-0" : "-translate-x-full",
              )}
              role="dialog"
              aria-modal="true"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-widest text-faint">Lumina</div>
                  <div className="truncate text-sm font-semibold text-primary">{UI.appName}</div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Chiudi menu"
                  className="flex h-9 w-9 items-center justify-center rounded-md text-faint hover:bg-surface-2 hover:text-primary"
                >
                  ✕
                </button>
              </div>

              {/* User */}
              <div className="border-b border-line px-5 py-3">
                <div className="truncate text-sm font-medium text-primary">{fullName}</div>
                <div className="text-xs text-muted">{ROLE_LABEL[role]}</div>
              </div>

              {/* Nav */}
              <nav className="flex-1 overflow-y-auto px-3 py-3">
                <ul className="space-y-1">
                  {items.map((it) => {
                    const active = it.href === activeHref;
                    return (
                      <li key={it.href}>
                        <Link
                          prefetch={false}
                          href={it.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center rounded-md px-4 py-3 text-[15px] transition-colors",
                            active
                              ? "bg-surface-2 font-semibold text-primary"
                              : "text-muted active:bg-surface-2 hover:bg-surface-2 hover:text-primary",
                          )}
                        >
                          {it.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* Footer: theme + logout */}
              <div className="space-y-3 border-t border-line px-5 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">Tema</span>
                  <ThemeToggle />
                </div>
                <form action={logout}>
                  <button
                    type="submit"
                    className="w-full rounded-md border border-line bg-surface px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-surface-2"
                  >
                    {UI.nav.logout}
                  </button>
                </form>
              </div>
            </aside>
          </>,
          document.body,
        )}
    </div>
  );
}
