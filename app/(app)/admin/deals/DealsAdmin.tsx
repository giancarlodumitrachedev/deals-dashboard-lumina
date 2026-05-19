"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { NewLeadModal } from "@/components/NewLeadModal";
import { DEAL_STATUS_LABEL, UI } from "@/lib/i18n/it";
import { formatEuro } from "@/lib/utils";
import { DEAL_STATUSES, type DealStatus, type UserRole } from "@/lib/types/domain";

interface DealRow {
  id: string;
  client_name: string;
  value: number;
  status: string;
  site_url: string | null;
  sales: string | null;
  dev: string | null;
  created_at: string;
  updated_at: string;
}

interface Staff {
  id: string;
  name: string;
  role: UserRole;
}

export function DealsAdmin({ deals, staff }: { deals: DealRow[]; staff: Staff[] }) {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | DealStatus>("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    return deals.filter((d) => {
      if (statusFilter && d.status !== statusFilter) return false;
      if (!q.trim()) return true;
      const needle = q.toLowerCase();
      return (
        d.client_name.toLowerCase().includes(needle) ||
        (d.sales ?? "").toLowerCase().includes(needle) ||
        (d.dev ?? "").toLowerCase().includes(needle)
      );
    });
  }, [deals, q, statusFilter]);

  // Suppress unused-variable warning on staff (kept for future shared usage)
  void staff;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold">Tutti i Deal</h1>
        <Button onClick={() => setOpen(true)}>+ {UI.buttons.newLead}</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Cerca cliente / agente / dev…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-sm"
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "" | DealStatus)}
          className="max-w-xs"
        >
          <option value="">Tutti gli stati</option>
          {DEAL_STATUSES.map((s) => (
            <option key={s} value={s}>{DEAL_STATUS_LABEL[s]}</option>
          ))}
        </Select>
        <div className="ml-auto text-xs text-muted">
          {filtered.length} su {deals.length}
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-surface-2 text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-2 font-medium">Cliente</th>
                <th className="px-4 py-2 font-medium">Stato</th>
                <th className="px-4 py-2 font-medium">Valore</th>
                <th className="px-4 py-2 font-medium">Agente</th>
                <th className="px-4 py-2 font-medium">Dev</th>
                <th className="px-4 py-2 font-medium">Aggiornato</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-surface-2">
                  <td className="px-4 py-2 font-medium text-primary">{d.client_name}</td>
                  <td className="px-4 py-2">
                    <Badge
                      tone={d.status === "won" ? "ok" : d.status === "cancelled" ? "alert" : "neutral"}
                    >
                      {DEAL_STATUS_LABEL[d.status as DealStatus]}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 text-primary">{formatEuro(d.value)}</td>
                  <td className="px-4 py-2 text-muted">{d.sales ?? "—"}</td>
                  <td className="px-4 py-2 text-muted">{d.dev ?? "—"}</td>
                  <td className="px-4 py-2 text-xs text-faint">
                    {new Date(d.updated_at).toLocaleDateString("it-IT")}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      href={`/admin/deals/${d.id}`}
                      className="text-xs text-muted hover:text-primary"
                    >
                      Apri →
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted">
                    Nessun deal trovato.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <NewLeadModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
