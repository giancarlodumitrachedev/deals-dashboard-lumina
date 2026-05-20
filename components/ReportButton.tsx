"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { UI } from "@/lib/i18n/it";
import type { ReportType, ReportSeverity } from "@/lib/types/domain";

const SEVERITIES: { value: ReportSeverity; label: string }[] = [
  { value: "low", label: UI.report.sevLow },
  { value: "medium", label: UI.report.sevMedium },
  { value: "high", label: UI.report.sevHigh },
  { value: "critical", label: UI.report.sevCritical },
];

export function ReportButton() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ReportType>("bug");
  const [severity, setSeverity] = useState<ReportSeverity>("medium");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function reset() {
    setType("bug"); setSeverity("medium"); setDescription(""); setErr(null); setDone(false);
  }

  async function submit() {
    setErr(null);
    if (description.trim().length < 5) { setErr("Descrizione troppo corta."); return; }
    setBusy(true);
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, severity, description: description.trim() }),
    });
    setBusy(false);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Errore" }));
      setErr(error ?? "Errore");
      return;
    }
    setDone(true);
  }

  return (
    <>
      <button
        onClick={() => { reset(); setOpen(true); }}
        title="Segnala bug o miglioramento"
        aria-label="Segnala"
        className="flex h-8 w-8 items-center justify-center rounded-md border border-line bg-surface text-base text-muted hover:bg-surface-2 hover:text-primary"
      >
        {/* bug glyph */}
        <span className="text-sm">🐞</span>
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={UI.report.title}>
        {done ? (
          <div className="space-y-4">
            <p className="text-sm text-emerald-700 dark:text-emerald-400">{UI.report.sent}</p>
            <div className="flex justify-end">
              <Button onClick={() => setOpen(false)}>Chiudi</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <span className="mb-1 block text-xs font-medium text-muted">Tipo</span>
              <div className="flex gap-2">
                <TypeChip active={type === "bug"} onClick={() => setType("bug")}>
                  {UI.report.typeBug}
                </TypeChip>
                <TypeChip active={type === "improvement"} onClick={() => setType("improvement")}>
                  {UI.report.typeImprovement}
                </TypeChip>
              </div>
            </div>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted">{UI.report.severity}</span>
              <Select value={severity} onChange={(e) => setSeverity(e.target.value as ReportSeverity)}>
                {SEVERITIES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </Select>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted">{UI.report.description}</span>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrivi il problema o il miglioramento…"
                className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
            </label>

            {err && (
              <div className="rounded-md border border-alert-ring bg-alert-soft px-3 py-1.5 text-xs text-alert">
                {err}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>Annulla</Button>
              <Button onClick={submit} disabled={busy || description.trim().length < 5}>
                {busy ? "..." : UI.report.submit}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

function TypeChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
        active ? "border-primary bg-primary text-base" : "border-line bg-surface text-muted hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
}
