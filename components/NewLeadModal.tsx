"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { UI } from "@/lib/i18n/it";

interface Row {
  client_name: string;
  phone_number: string;
  email: string;
  website: string;
  job: string;
  value: string;
  notes: string;
}

const emptyRow = (): Row => ({
  client_name: "",
  phone_number: "",
  email: "",
  website: "",
  job: "",
  value: "",
  notes: "",
});

// Accepts only digits and a single leading + while typing.
function normalizePhoneInput(v: string): string {
  if (v.startsWith("+")) {
    return "+" + v.slice(1).replace(/[^\d]/g, "");
  }
  return v.replace(/[^\d]/g, "");
}

function validateRow(r: Row): string | null {
  if (r.client_name.trim().length < 2) return "Nome cliente richiesto.";
  if (r.phone_number && !/^\+?\d{6,20}$/.test(r.phone_number)) {
    return "Telefono non valido (solo cifre e + iniziale).";
  }
  if (r.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email)) {
    return "Email non valida.";
  }
  if (r.website && !/^https?:\/\//i.test(r.website)) {
    return "Sito web: usa http:// o https://";
  }
  if (r.value && Number.isNaN(Number(r.value))) return "Valore non valido.";
  return null;
}

export function NewLeadModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([emptyRow()]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function updateRow(i: number, patch: Partial<Row>) {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function addRow() {
    setRows((rs) => [...rs, emptyRow()]);
  }
  function removeRow(i: number) {
    setRows((rs) => (rs.length === 1 ? rs : rs.filter((_, idx) => idx !== i)));
  }

  async function submit() {
    setErr(null);
    for (const r of rows) {
      const v = validateRow(r);
      if (v) { setErr(v); return; }
    }
    setBusy(true);
    const payload = rows.map((r) => ({
      client_name: r.client_name.trim(),
      phone_number: r.phone_number.trim() || null,
      email: r.email.trim() || null,
      website: r.website.trim() || null,
      job: r.job.trim() || null,
      value: Number(r.value) || 0,
      notes: r.notes.trim() || null,
    }));
    const res = await fetch("/api/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setBusy(false);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Errore" }));
      setErr(error ?? "Errore");
      return;
    }
    setRows([emptyRow()]);
    onClose();
    router.refresh();
  }

  return (
    <Modal open={open} onClose={onClose} title={`${UI.buttons.newLead}${rows.length > 1 ? ` (${rows.length})` : ""}`} size="xl">
      <div className="space-y-4">
        {rows.map((r, i) => (
          <div
            key={i}
            className="rounded-md border border-line bg-surface-2 p-4"
          >
            {rows.length > 1 && (
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-muted">
                  Lead #{i + 1}
                </span>
                <button
                  onClick={() => removeRow(i)}
                  className="text-xs text-faint hover:text-alert"
                >
                  Rimuovi
                </button>
              </div>
            )}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label={UI.fields.clientName}>
                <Input value={r.client_name} onChange={(e) => updateRow(i, { client_name: e.target.value })} />
              </Field>
              <Field label={UI.fields.phone}>
                <Input
                  inputMode="tel"
                  placeholder="+39 …"
                  value={r.phone_number}
                  onChange={(e) => updateRow(i, { phone_number: normalizePhoneInput(e.target.value) })}
                />
              </Field>
              <Field label={UI.fields.email}>
                <Input
                  type="email"
                  placeholder="cliente@esempio.it"
                  value={r.email}
                  onChange={(e) => updateRow(i, { email: e.target.value })}
                />
              </Field>
              <Field label={UI.fields.website}>
                <Input
                  type="url"
                  placeholder="https://…"
                  value={r.website}
                  onChange={(e) => updateRow(i, { website: e.target.value })}
                />
              </Field>
              <Field label={UI.fields.job}>
                <Input
                  placeholder="es. Dentista, Ristoratore…"
                  value={r.job}
                  onChange={(e) => updateRow(i, { job: e.target.value })}
                />
              </Field>
              <Field label={UI.fields.value}>
                <Input
                  type="number"
                  min={0}
                  value={r.value}
                  onChange={(e) => updateRow(i, { value: e.target.value })}
                />
              </Field>
              <Field label={UI.fields.notes} className="md:col-span-2">
                <textarea
                  rows={2}
                  value={r.notes}
                  onChange={(e) => updateRow(i, { notes: e.target.value })}
                  className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                />
              </Field>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addRow}
          className="w-full rounded-md border border-dashed border-line py-2 text-xs font-medium text-muted hover:bg-surface-2 hover:text-primary"
        >
          + Aggiungi un altro lead
        </button>

        {err && (
          <div className="rounded-md border border-alert-ring bg-alert-soft px-3 py-1.5 text-xs text-alert">
            {err}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-faint">
            {rows.length === 1 ? "1 lead da creare" : `${rows.length} lead da creare`}
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>{UI.buttons.cancel}</Button>
            <Button onClick={submit} disabled={busy}>
              {busy ? "..." : rows.length === 1 ? UI.buttons.save : `Crea ${rows.length} lead`}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
