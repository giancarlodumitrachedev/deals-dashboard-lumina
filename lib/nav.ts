import type { UserRole } from "@/lib/types/domain";
import { UI } from "@/lib/i18n/it";

export interface NavItem {
  href: string;
  label: string;
}

export const NAV: Record<UserRole, NavItem[]> = {
  admin: [
    { href: "/admin", label: UI.nav.operativita },
    { href: "/admin/deals", label: "Deal" },
    { href: "/admin/users", label: "Utenti" },
    { href: "/admin/analytics", label: UI.nav.analitiche },
    { href: "/admin/commissions", label: UI.nav.commissioni },
    { href: "/admin/reports", label: "Segnalazioni" },
    { href: "/admin/settings", label: "Impostazioni" },
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

// Single best-matching nav href (longest prefix) for the given pathname.
export function activeNavHref(items: NavItem[], pathname: string): string {
  return (
    items
      .filter((i) => pathname === i.href || pathname.startsWith(i.href + "/"))
      .sort((a, b) => b.href.length - a.href.length)[0]?.href ?? ""
  );
}
