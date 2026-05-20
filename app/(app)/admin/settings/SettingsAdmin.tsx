"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ROLE_LABEL } from "@/lib/i18n/it";
import type { UserRole } from "@/lib/types/domain";

// Editable permission actions and their human descriptions.
const EDITABLE_ACTIONS: { action: string; label: string; hint: string }[] = [
  { action: "view_all_deals", label: "Vedere tutti i deal", hint: "Accesso a tutti i deal, non solo i propri" },
  { action: "create_lead", label: "Creare lead", hint: "Aggiungere nuovi lead" },
  { action: "assign_deals", label: "Assegnare deal", hint: "Assegnare agente e sviluppatore" },
  { action: "update_deal_status", label: "Cambiare stato deal", hint: "Spostare i deal nella pipeline" },
  { action: "upload_site", label: "Caricare sito", hint: "Inserire l'URL del sito pronto" },
  { action: "mark_paid", label: "Gestire pagamenti", hint: "Segnare commissioni come pagate" },
  { action: "view_analytics", label: "Vedere analitiche globali", hint: "Dashboard analitiche aziendali" },
];

const EDITABLE_ROLES: UserRole[] = ["manager", "developer", "sales"];

export function SettingsAdmin({
  whatsappTemplate,
  matrix,
}: {
  whatsappTemplate: string;
  matrix: Record<string, string[]>;
}) {
  return (
    <div className="space-y-4">
      <WhatsappCard initial={whatsappTemplate} />
      <PermissionsCard matrix={matrix} />
    </div>
  );
}

function WhatsappCard({ initial }: { initial: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setMsg(null); setBusy(true);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "whatsapp_template", value }),
    });
    setBusy(false);
    setMsg(res.ok ? "Messaggio salvato." : "Errore nel salvataggio.");
    if (res.ok) router.refresh();
  }

  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold">Messaggio WhatsApp predefinito</h2>
      <p className="mt-1 text-xs text-muted">
        Usa <code className="rounded bg-surface-2 px-1">{"{client}"}</code> per il nome cliente e{" "}
        <code className="rounded bg-surface-2 px-1">{"{url}"}</code> per il link del sito.
      </p>
      <textarea
        rows={5}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="mt-3 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
      />
      <div className="mt-3 flex items-center gap-3">
        <Button onClick={save} disabled={busy}>Salva messaggio</Button>
        {msg && <span className="text-xs text-muted">{msg}</span>}
      </div>
    </Card>
  );
}

function PermissionsCard({ matrix }: { matrix: Record<string, string[]> }) {
  // Local copy for optimistic toggles
  const [state, setState] = useState<Record<string, Set<string>>>(() => {
    const out: Record<string, Set<string>> = {};
    for (const r of EDITABLE_ROLES) out[r] = new Set(matrix[r] ?? []);
    return out;
  });
  const [busy, setBusy] = useState<string | null>(null);

  async function toggle(role: UserRole, action: string) {
    const enabled = !state[role].has(action);
    const key = `${role}:${action}`;
    setBusy(key);
    // optimistic
    setState((s) => {
      const next = new Set(s[role]);
      if (enabled) next.add(action); else next.delete(action);
      return { ...s, [role]: next };
    });
    const res = await fetch("/api/permissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, action, enabled }),
    });
    setBusy(null);
    if (!res.ok) {
      // revert
      setState((s) => {
        const next = new Set(s[role]);
        if (enabled) next.delete(action); else next.add(action);
        return { ...s, [role]: next };
      });
      alert("Errore aggiornamento permesso");
    }
  }

  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold">Permessi per ruolo</h2>
      <p className="mt-1 text-xs text-muted">
        L&apos;amministratore ha sempre tutti i permessi. Le modifiche sono immediate.
      </p>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="py-2 pr-4 font-medium">Permesso</th>
              {EDITABLE_ROLES.map((r) => (
                <th key={r} className="px-3 py-2 text-center font-medium">{ROLE_LABEL[r]}</th>
              ))}
              <th className="px-3 py-2 text-center font-medium text-faint">{ROLE_LABEL.admin}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {EDITABLE_ACTIONS.map((a) => (
              <tr key={a.action}>
                <td className="py-2 pr-4">
                  <div className="font-medium text-primary">{a.label}</div>
                  <div className="text-[11px] text-faint">{a.hint}</div>
                </td>
                {EDITABLE_ROLES.map((r) => {
                  const on = state[r].has(a.action);
                  const key = `${r}:${a.action}`;
                  return (
                    <td key={r} className="px-3 py-2 text-center">
                      <button
                        disabled={busy === key}
                        onClick={() => toggle(r, a.action)}
                        className={`inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          on ? "bg-emerald-500" : "bg-faint"
                        } disabled:opacity-50`}
                        aria-label={`${a.label} per ${ROLE_LABEL[r]}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            on ? "translate-x-4" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </td>
                  );
                })}
                <td className="px-3 py-2 text-center text-emerald-500">✓</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
