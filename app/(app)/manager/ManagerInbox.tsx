"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { UI } from "@/lib/i18n/it";
import { formatEuro } from "@/lib/utils";
import { useRealtimeDeals } from "@/components/useRealtimeDeals";

interface Lead {
  id: string;
  client_name: string;
  phone_number: string | null;
  value: number;
  assigned_sales_id: string | null;
  assigned_dev_id: string | null;
}

interface Staff {
  id: string;
  name: string;
}

export function ManagerInbox({
  deals,
  devs,
  sales,
}: {
  deals: Lead[];
  devs: Staff[];
  sales: Staff[];
}) {
  const router = useRouter();
  useRealtimeDeals(() => router.refresh());
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-primary">Nuovi Lead</h1>
        <Button onClick={() => setModalOpen(true)}>{UI.buttons.newLead}</Button>
      </div>

      {deals.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted">{UI.empty.noLeads}</Card>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {deals.map((d) => (
            <LeadRow key={d.id} deal={d} devs={devs} sales={sales} />
          ))}
        </div>
      )}

      <NewLeadModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

function LeadRow({ deal, devs, sales }: { deal: Lead; devs: Staff[]; sales: Staff[] }) {
  const router = useRouter();
  const [dev, setDev] = useState(deal.assigned_dev_id ?? "");
  const [sal, setSal] = useState(deal.assigned_sales_id ?? "");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const res = await fetch(`/api/deals/${deal.id}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assigned_dev_id: dev || null,
        assigned_sales_id: sal || null,
      }),
    });
    setBusy(false);
    if (!res.ok) alert("Errore");
    router.refresh();
  }

  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[2fr_1fr_1fr_auto] md:items-center">
        <div>
          <div className="text-sm font-medium text-primary">{deal.client_name}</div>
          <div className="text-xs text-muted">
            {deal.phone_number ?? "—"} · {formatEuro(deal.value)}
          </div>
        </div>
        <Select value={dev} onChange={(e) => setDev(e.target.value)}>
          <option value="">{UI.fields.assignedDev}</option>
          {devs.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </Select>
        <Select value={sal} onChange={(e) => setSal(e.target.value)}>
          <option value="">{UI.fields.assignedSales}</option>
          {sales.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </Select>
        <Button size="sm" onClick={save} disabled={busy}>
          {busy ? "..." : UI.buttons.assign}
        </Button>
      </div>
    </Card>
  );
}

function NewLeadModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [client, setClient] = useState("");
  const [phone, setPhone] = useState("");
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setErr(null);
    setBusy(true);
    const res = await fetch(`/api/deals`, {
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
            className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10"
          />
        </Field>
        {err && (
          <div className="rounded-md border border-alert-ring bg-alert-soft px-3 py-1.5 text-xs text-alert">
            {err}
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            {UI.buttons.cancel}
          </Button>
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
      <span className="mb-1 block text-xs font-medium text-primary">{label}</span>
      {children}
    </label>
  );
}
