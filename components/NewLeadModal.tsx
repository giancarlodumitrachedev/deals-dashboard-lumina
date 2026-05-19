"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { UI } from "@/lib/i18n/it";

export function NewLeadModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [client, setClient] = useState("");
  const [phone, setPhone] = useState("");
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setErr(null); setBusy(true);
    const res = await fetch("/api/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_name: client.trim(),
        phone_number: phone.trim() || null,
        value: Number(value) || 0,
        notes: notes.trim() || null,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Errore" }));
      setErr(error ?? "Errore");
      return;
    }
    setClient(""); setPhone(""); setValue(""); setNotes("");
    onClose();
    router.refresh();
  }

  return (
    <Modal open={open} onClose={onClose} title={UI.buttons.newLead}>
      <div className="space-y-3">
        <Field label={UI.fields.clientName}>
          <Input value={client} onChange={(e) => setClient(e.target.value)} />
        </Field>
        <Field label={UI.fields.phone}>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Field>
        <Field label={UI.fields.value}>
          <Input type="number" min={0} value={value} onChange={(e) => setValue(e.target.value)} />
        </Field>
        <Field label={UI.fields.notes}>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
          />
        </Field>
        {err && (
          <div className="rounded-md border border-alert-ring bg-alert-soft px-3 py-1.5 text-xs text-alert">
            {err}
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>{UI.buttons.cancel}</Button>
          <Button onClick={submit} disabled={busy || client.trim().length < 2}>
            {busy ? "..." : UI.buttons.save}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
