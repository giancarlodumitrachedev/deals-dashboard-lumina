import { LoginForm } from "./login-form";
import { UI } from "@/lib/i18n/it";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-base px-4">
      <div className="w-full max-w-sm rounded-lg border border-line bg-surface p-8 shadow-card">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-widest text-faint">Lumina Digital</div>
          <h1 className="mt-1 text-2xl font-semibold text-primary">{UI.login.title}</h1>
          <p className="mt-1 text-sm text-muted">{UI.login.subtitle}</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
