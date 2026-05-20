"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { COMMISSION_STATUS_LABEL, UI } from "@/lib/i18n/it";
import { formatEuro } from "@/lib/utils";

interface CommissionRow {
  id: string;
  amount: number;
  status: "pending" | "paid";
  paid_at: string | null;
  receipt_url: string | null;
  created_at: string;
  deal: { id: string; client_name: string; value: number } | null;
  user: { id: string; full_name: string } | null;
  iban: string | null;
  payment_method: string | null;
}

export function CommissioniTab({ commissions }: { commissions: CommissionRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function toggle(id: string) {
    setBusy(id);
    const res = await fetch(`/api/commissions/${id}/toggle`, { method: "POST" });
    setBusy(null);
    if (!res.ok) alert("Errore");
    router.refresh();
  }

  async function saveReceipt(id: string, url: string) {
    setBusy(id);
    const res = await fetch(`/api/commissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receipt_url: url.trim() || null }),
    });
    setBusy(null);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Errore" }));
      alert(error ?? "Errore");
      return;
    }
    router.refresh();
  }

  if (commissions.length === 0) {
    return <Card className="p-8 text-center text-sm text-muted">{UI.empty.noCommissions}</Card>;
  }

  return (
    <div className="space-y-2">
      {commissions.map((c) => (
        <CommissionCard
          key={c.id}
          row={c}
          busy={busy === c.id}
          onToggle={() => toggle(c.id)}
          onSaveReceipt={(url) => saveReceipt(c.id, url)}
        />
      ))}
    </div>
  );
}

function CommissionCard({
  row,
  busy,
  onToggle,
  onSaveReceipt,
}: {
  row: CommissionRow;
  busy: boolean;
  onToggle: () => void;
  onSaveReceipt: (url: string) => void;
}) {
  const [receipt, setReceipt] = useState(row.receipt_url ?? "");

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-primary">{row.deal?.client_name ?? "—"}</span>
            <Badge tone={row.status === "paid" ? "ok" : "alert"}>
              {COMMISSION_STATUS_LABEL[row.status]}
            </Badge>
          </div>
          <div className="mt-0.5 text-xs text-muted">
            {row.user?.full_name ?? "—"} · {formatEuro(row.amount)}
            {row.paid_at && ` · pagata ${new Date(row.paid_at).toLocaleDateString("it-IT")}`}
          </div>
          <div className="mt-1 text-xs text-faint">
            {row.iban ? `IBAN: ${row.iban}` : "IBAN non impostato"}
            {row.payment_method ? ` · ${row.payment_method}` : ""}
          </div>
        </div>
        <Button size="sm" variant="secondary" disabled={busy} onClick={onToggle}>
          {row.status === "paid" ? "Annulla pagamento" : "Segna come pagata"}
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-line pt-3">
        <label className="flex-1 min-w-[220px]">
          <span className="mb-1 block text-xs font-medium text-muted">Ricevuta (URL)</span>
          <Input
            type="url"
            value={receipt}
            onChange={(e) => setReceipt(e.target.value)}
            placeholder="https://… link alla ricevuta"
          />
        </label>
        <Button size="sm" variant="ghost" disabled={busy} onClick={() => onSaveReceipt(receipt)}>
          Salva ricevuta
        </Button>
        {row.receipt_url && (
          <a
            href={row.receipt_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted underline-offset-2 hover:text-primary hover:underline"
          >
            Apri ricevuta →
          </a>
        )}
      </div>
    </Card>
  );
}
