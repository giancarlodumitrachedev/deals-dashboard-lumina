"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { UI } from "@/lib/i18n/it";
import { login } from "./actions";

const initialState: { error: string | null } = { error: null };

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "..." : UI.login.submit}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useFormState(login, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-ink-700">
          {UI.login.email}
        </label>
        <Input type="email" name="email" autoComplete="email" required />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink-700">
          {UI.login.password}
        </label>
        <Input type="password" name="password" autoComplete="current-password" required />
      </div>
      {state.error && (
        <div className="rounded-md border border-alert-ring bg-alert-soft px-3 py-2 text-xs text-alert">
          {state.error}
        </div>
      )}
      <Submit />
    </form>
  );
}
