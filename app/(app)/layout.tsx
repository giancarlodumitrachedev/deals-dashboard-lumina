import { requireSession, roleLandingPath } from "@/lib/auth";
import { logout } from "@/app/login/actions";
import { ROLE_LABEL, UI } from "@/lib/i18n/it";
import { HandoffBanner } from "@/components/HandoffBanner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ReportButton } from "@/components/ReportButton";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const home = roleLandingPath(session.role);

  return (
    <div className="flex min-h-screen bg-base text-primary">
      <Sidebar role={session.role} />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
          <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
            <MobileNav role={session.role} />
            <Link href={home} className="flex items-center gap-2 lg:hidden">
              <span className="text-sm font-semibold tracking-tight">{UI.appName}</span>
            </Link>
            <div className="hidden text-xs text-muted lg:block">
              {ROLE_LABEL[session.role]} · {session.fullName}
            </div>
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <ReportButton />
              <ThemeToggle />
              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-md border border-line bg-surface px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-surface-2"
                >
                  {UI.nav.logout}
                </button>
              </form>
            </div>
          </div>
        </header>

        {session.role === "sales" && <HandoffBanner userId={session.userId} />}

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
