import Link from "next/link";
import { requireSession, roleLandingPath } from "@/lib/auth";
import { logout } from "@/app/login/actions";
import { ROLE_LABEL, UI } from "@/lib/i18n/it";
import { HandoffBanner } from "@/components/HandoffBanner";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const home = roleLandingPath(session.role);

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <header className="sticky top-0 z-30 border-b border-ink-200 bg-white">
        <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-6">
          <Link href={home} className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight text-ink-900">
              {UI.appName}
            </span>
            <span className="rounded bg-ink-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-ink-600">
              {ROLE_LABEL[session.role]}
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-ink-500 sm:inline">
              {session.fullName}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-md border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50"
              >
                {UI.nav.logout}
              </button>
            </form>
          </div>
        </div>
      </header>

      {session.role === "sales" && <HandoffBanner userId={session.userId} />}

      <main className="mx-auto w-full max-w-screen-2xl flex-1 px-6 py-6">
        {children}
      </main>
    </div>
  );
}
