"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  DEAL_STATUS_LABEL,
  FOLLOW_UP_STATUS_LABEL,
  COMMISSION_STATUS_LABEL,
} from "@/lib/i18n/it";
import { formatEuro } from "@/lib/utils";
import {
  DEAL_STATUSES,
  type Deal,
  type DealEvent,
  type FollowUp,
  type Commission,
  type DealStatus,
} from "@/lib/types/domain";

interface Staff {
  id: string;
  name: string;
}

export function DealDetail({
  deal,
  events,
  followUps,
  commissions,
  sales,
  devs,
}: {
  deal: Deal;
  events: DealEvent[];
  followUps: FollowUp[];
  commissions: Commission[];
  sales: Staff[];
  devs: Staff[];
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    client_name: deal.client_name,
    phone_number: deal.phone_number ?? "",
    value: String(deal.value),
    status: deal.status,
    site_url: deal.site_url ?? "",
    assigned_sales_id: deal.assigned_sales_id ?? "",
    assigned_dev_id: deal.assigned_dev_id ?? "",
    notes: deal.notes ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    setMsg(null); setErr(null); setBusy(true);
    const payload = {
      client_name: form.client_name.trim(),
      phone_number: form.phone_number.trim() || null,
      value: Number(form.value) || 0,
      status: form.status,
      site_url: form.site_url.trim() || null,
      assigned_sales_id: form.assigned_sales_id || null,
      assigned_dev_id: form.assigned_dev_id || null,
      notes: form.notes.trim() || null,
    };
    const res = await fetch(`/api/deals/${deal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setBusy(false);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Errore" }));
      setErr(error ?? "Errore");
      return;
    }
    setMsg("Deal aggiornato.");
    router.refresh();
  }

  async function destroy() {
    if (!confirm("Eliminare definitivamente questo deal?")) return;
    setBusy(true);
    const res = await fetch(`/api/deals/${deal.id}`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) { setErr("Errore eliminazione"); return; }
    router.push("/admin/deals");
  }

  async function toggleCommission(id: string) {
    const res = await fetch(`/api/commissions/${id}/toggle`, { method: "POST" });
    if (!res.ok) { alert("Errore"); return; }
    router.refresh();
  }

  async function followUpDone(id: string) {
    const res = await fetch(`/api/follow-ups/${id}/done`, { method: "POST" });
    if (!res.ok) { alert("Errore"); return; }
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/admin/deals" className="text-sm text-muted hover:text-primary">
          ← Deal
        </Link>
      </div>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{deal.client_name}</h1>
          <p className="text-sm text-muted">{formatEuro(deal.value)} · creato {new Date(deal.created_at).toLocaleDateString("it-IT")}</p>
        </div>
        <Badge tone={deal.status === "won" ? "ok" : deal.status === "cancelled" ? "alert" : "neutral"}>
          {DEAL_STATUS_LABEL[deal.status]}
        </Badge>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold">Dettagli</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="Nome cliente">
                <Input value={form.client_name} onChange={(e) => update("client_name", e.target.value)} />
              </Field>
              <Field label="Telefono">
                <Input value={form.phone_number} onChange={(e) => update("phone_number", e.target.value)} />
              </Field>
              <Field label="Valore (€)">
                <Input
                  type="number"
                  min={0}
                  value={form.value}
                  onChange={(e) => update("value", e.target.value)}
                />
              </Field>
              <Field label="Stato">
                <Select value={form.status} onChange={(e) => update("status", e.target.value as DealStatus)}>
                  {DEAL_STATUSES.map((s) => (
                    <option key={s} value={s}>{DEAL_STATUS_LABEL[s]}</option>
                  ))}
                </Select>
              </Field>
              <Field label="URL sito">
                <Input
                  type="url"
                  value={form.site_url}
                  onChange={(e) => update("site_url", e.target.value)}
                  placeholder="https://..."
                />
              </Field>
              <Field label="Agente">
                <Select
                  value={form.assigned_sales_id}
                  onChange={(e) => update("assigned_sales_id", e.target.value)}
                >
                  <option value="">— Nessuno —</option>
                  {sales.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Select>
              </Field>
              <Field label="Sviluppatore">
                <Select
                  value={form.assigned_dev_id}
                  onChange={(e) => update("assigned_dev_id", e.target.value)}
                >
                  <option value="">— Nessuno —</option>
                  {devs.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Select>
              </Field>
              <Field label="Note" className="md:col-span-2">
                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                />
              </Field>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button onClick={save} disabled={busy}>Salva</Button>
              <Button variant="danger" onClick={destroy} disabled={busy}>Elimina</Button>
              {msg && <span className="text-xs text-emerald-700 dark:text-emerald-400">{msg}</span>}
              {err && <span className="text-xs text-alert">{err}</span>}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold">Follow-up</h2>
            {followUps.length === 0 ? (
              <p className="text-sm text-muted">Nessun follow-up programmato.</p>
            ) : (
              <ul className="space-y-2">
                {followUps.map((f) => (
                  <li key={f.id} className="flex items-center justify-between rounded-md border border-line bg-surface-2 px-3 py-2">
                    <div className="text-sm">
                      <span className="font-medium">Step {f.step_number}</span>
                      <span className="ml-2 text-muted">
                        {new Date(f.scheduled_date).toLocaleDateString("it-IT")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        tone={f.status === "done" ? "ok" : f.status === "missed" ? "alert" : "neutral"}
                      >
                        {FOLLOW_UP_STATUS_LABEL[f.status]}
                      </Badge>
                      {f.status === "pending" && (
                        <Button size="sm" variant="secondary" onClick={() => followUpDone(f.id)}>
                          Fatto
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {commissions.length > 0 && (
            <Card className="p-5">
              <h2 className="mb-3 text-sm font-semibold">Commissioni</h2>
              <ul className="space-y-2">
                {commissions.map((c) => (
                  <li key={c.id} className="flex items-center justify-between rounded-md border border-line bg-surface-2 px-3 py-2">
                    <div className="text-sm">
                      <span className="font-medium">{formatEuro(c.amount)}</span>
                      {c.paid_at && (
                        <span className="ml-2 text-xs text-muted">
                          pagata il {new Date(c.paid_at).toLocaleDateString("it-IT")}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={c.status === "paid" ? "ok" : "alert"}>
                        {COMMISSION_STATUS_LABEL[c.status]}
                      </Badge>
                      <Button size="sm" variant="secondary" onClick={() => toggleCommission(c.id)}>
                        {c.status === "paid" ? "Annulla pagamento" : "Segna come pagata"}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <Card className="p-5">
          <h2 className="mb-3 text-sm font-semibold">Cronologia</h2>
          {events.length === 0 ? (
            <p className="text-sm text-muted">Nessun evento.</p>
          ) : (
            <ol className="space-y-3">
              {events.map((e) => (
                <li key={e.id} className="border-l-2 border-line pl-3">
                  <div className="text-sm text-primary">{e.action_description}</div>
                  <div className="text-[11px] text-muted">
                    {new Date(e.created_at).toLocaleString("it-IT")}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
    </div>
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
