"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { COMMISSION_STATUS_LABEL, UI } from "@/lib/i18n/it";
import { formatEuro } from "@/lib/utils";

interface CommissionRow {
  id: string;
  amount: number;
  status: "pending" | "paid";
  paid_at: string | null;
  created_at: string;
  deal: { id: string; client_name: string; value: number } | null;
  user: { id: string; full_name: string } | null;
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

  if (commissions.length === 0) {
    return (
      <Card className="p-8 text-center text-sm text-muted">{UI.empty.noCommissions}</Card>
    );
  }

  return (
    <Card>
      <table className="w-full text-sm">
        <thead className="border-b border-line bg-base text-left text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="px-4 py-2 font-medium">Cliente</th>
            <th className="px-4 py-2 font-medium">Agente</th>
            <th className="px-4 py-2 font-medium">Importo</th>
            <th className="px-4 py-2 font-medium">Stato</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {commissions.map((c) => (
            <tr key={c.id}>
              <td className="px-4 py-2 font-medium text-primary">{c.deal?.client_name ?? "—"}</td>
              <td className="px-4 py-2 text-primary">{c.user?.full_name ?? "—"}</td>
              <td className="px-4 py-2 text-primary">{formatEuro(c.amount)}</td>
              <td className="px-4 py-2">
                <Badge tone={c.status === "paid" ? "ok" : "alert"}>
                  {COMMISSION_STATUS_LABEL[c.status]}
                </Badge>
              </td>
              <td className="px-4 py-2">
                <Toggle on={c.status === "paid"} disabled={busy === c.id} onClick={() => toggle(c.id)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function Toggle({
  on,
  onClick,
  disabled,
}: {
  on: boolean;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        on ? "bg-emerald-500" : "bg-faint"
      } disabled:opacity-50`}
      aria-label="Toggle pagamento"
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-surface shadow transition-transform ${
          on ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
