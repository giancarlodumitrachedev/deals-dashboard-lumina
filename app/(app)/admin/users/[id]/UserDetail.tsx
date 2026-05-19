"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DEAL_STATUS_LABEL, ROLE_LABEL } from "@/lib/i18n/it";
import { formatEuro } from "@/lib/utils";
import type { UserRole, DealStatus } from "@/lib/types/domain";

interface User {
  id: string;
  full_name: string;
  email: string;
  is_active: boolean;
  role: UserRole;
  created_at: string;
}

interface DealRow {
  id: string;
  client_name: string;
  value: number;
  status: DealStatus;
  created_at: string;
}

interface Stats {
  wonCount: number;
  cancelledCount: number;
  pipelineValue: number;
  conversion: number;
  totalCommissions: number;
  pendingCommissions: number;
}

export function UserDetail({
  user,
  selfId,
  stats,
  deals,
}: {
  user: User;
  selfId: string;
  stats: Stats;
  deals: DealRow[];
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(user.full_name);
  const [role, setRole] = useState<UserRole>(user.role);
  const [isActive, setIsActive] = useState(user.is_active);
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setMsg(null); setErr(null); setBusy(true);
    const res = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: fullName, role, is_active: isActive }),
    });
    setBusy(false);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Errore" }));
      setErr(error ?? "Errore");
      return;
    }
    setMsg("Profilo aggiornato.");
    router.refresh();
  }

  async function resetPassword() {
    if (newPassword.length < 8) return;
    setMsg(null); setErr(null); setBusy(true);
    const res = await fetch(`/api/users/${user.id}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });
    setBusy(false);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Errore" }));
      setErr(error ?? "Errore");
      return;
    }
    setNewPassword("");
    setMsg("Password reimpostata.");
  }

  async function destroy() {
    if (!confirm("Eliminare definitivamente questo utente?")) return;
    setBusy(true);
    const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Errore" }));
      setErr(error ?? "Errore");
      return;
    }
    router.push("/admin/users");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/admin/users" className="text-sm text-muted hover:text-primary">
          ← Utenti
        </Link>
      </div>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{user.full_name}</h1>
          <p className="text-sm text-muted">{user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={user.is_active ? "ok" : "muted"}>
            {user.is_active ? "Attivo" : "Disattivo"}
          </Badge>
          <Badge tone="neutral">{ROLE_LABEL[user.role]}</Badge>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Deal vinti" value={String(stats.wonCount)} />
        <Stat label="Conversione" value={`${stats.conversion}%`} />
        <Stat label="Pipeline" value={formatEuro(stats.pipelineValue)} />
        <Stat label="Commissioni da pagare" value={formatEuro(stats.pendingCommissions)} tone="alert" />
      </section>

      <Card className="p-5">
        <h2 className="mb-3 text-sm font-semibold">Profilo</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="Nome completo">
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </Field>
          <Field label="Ruolo">
            <Select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
              {(["admin", "manager", "developer", "sales"] as UserRole[]).map((r) => (
                <option key={r} value={r}>{ROLE_LABEL[r]}</option>
              ))}
            </Select>
          </Field>
          <Field label="Stato">
            <Select
              value={isActive ? "active" : "inactive"}
              onChange={(e) => setIsActive(e.target.value === "active")}
            >
              <option value="active">Attivo</option>
              <option value="inactive">Disattivo</option>
            </Select>
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button onClick={save} disabled={busy}>Salva</Button>
          {user.id !== selfId && (
            <Button variant="danger" onClick={destroy} disabled={busy}>Elimina utente</Button>
          )}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 text-sm font-semibold">Reimposta password</h2>
        <div className="flex flex-wrap items-end gap-2">
          <Field label="Nuova password (min 8)" className="flex-1 min-w-[240px]">
            <Input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Field>
          <Button onClick={resetPassword} disabled={busy || newPassword.length < 8}>
            Imposta password
          </Button>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 text-sm font-semibold">Deal assegnati</h2>
        {deals.length === 0 ? (
          <p className="text-sm text-muted">Nessun deal.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="py-2 font-medium">Cliente</th>
                <th className="py-2 font-medium">Stato</th>
                <th className="py-2 font-medium">Valore</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {deals.map((d) => (
                <tr key={d.id}>
                  <td className="py-2">{d.client_name}</td>
                  <td className="py-2 text-muted">{DEAL_STATUS_LABEL[d.status]}</td>
                  <td className="py-2 text-primary">{formatEuro(d.value)}</td>
                  <td className="py-2 text-right">
                    <Link href={`/admin/deals/${d.id}`} className="text-xs text-muted hover:text-primary">
                      Apri →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {msg && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          {msg}
        </div>
      )}
      {err && (
        <div className="rounded-md border border-alert-ring bg-alert-soft px-3 py-2 text-xs text-alert">
          {err}
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "alert";
}) {
  return (
    <Card className="p-4">
      <div className="text-xs uppercase tracking-wider text-muted">{label}</div>
      <div className={`mt-1 text-xl font-semibold ${tone === "alert" ? "text-alert" : "text-primary"}`}>
        {value}
      </div>
    </Card>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
