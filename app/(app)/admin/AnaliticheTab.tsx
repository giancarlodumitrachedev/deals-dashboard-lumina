"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card } from "@/components/ui/Card";
import { DEAL_STATUS_LABEL } from "@/lib/i18n/it";
import { DEAL_STATUSES } from "@/lib/types/domain";
import { formatEuro } from "@/lib/utils";
import type { AdminDealSummary } from "./OperativitaTab";

const COLORS = ["#171717", "#525252", "#a3a3a3", "#dc2626", "#f59e0b", "#10b981", "#3b82f6"];

export function AnaliticheTab({ deals }: { deals: AdminDealSummary[] }) {
  const stats = useMemo(() => {
    const won = deals.filter((d) => d.status === "won");
    const cancelled = deals.filter((d) => d.status === "cancelled");
    const total = won.length + cancelled.length;
    const winRate = total > 0 ? Math.round((won.length / total) * 100) : 0;
    const wonValue = won.reduce((s, d) => s + Number(d.value), 0);
    const pipelineValue = deals
      .filter((d) => ["ready_to_pitch", "decision_pending", "payment_pending"].includes(d.status))
      .reduce((s, d) => s + Number(d.value), 0);

    const byStatus = DEAL_STATUSES.map((s) => ({
      status: DEAL_STATUS_LABEL[s],
      count: deals.filter((d) => d.status === s).length,
    }));

    const bySalesId: Record<string, { id: string; won: number; pitched: number }> = {};
    for (const d of deals) {
      if (!d.assigned_sales_id) continue;
      const r = (bySalesId[d.assigned_sales_id] ??= { id: d.assigned_sales_id, won: 0, pitched: 0 });
      if (d.status === "won") r.won += 1;
      if (["ready_to_pitch", "decision_pending", "payment_pending", "won", "cancelled"].includes(d.status)) {
        r.pitched += 1;
      }
    }
    const perSales = Object.values(bySalesId).map((r) => ({
      id: r.id.slice(0, 6),
      conversion: r.pitched > 0 ? Math.round((r.won / r.pitched) * 100) : 0,
    }));

    // Pipeline bottleneck: which status holds the highest avg age in days?
    const ageByStatus = DEAL_STATUSES.map((s) => {
      const ds = deals.filter((d) => d.status === s);
      const avgDays =
        ds.length === 0
          ? 0
          : Math.round(
              ds.reduce(
                (sum, d) =>
                  sum + (Date.now() - new Date(d.updated_at).getTime()) / (1000 * 60 * 60 * 24),
                0,
              ) / ds.length,
            );
      return { status: DEAL_STATUS_LABEL[s], avgDays };
    });

    return { winRate, wonValue, pipelineValue, byStatus, perSales, ageByStatus };
  }, [deals]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <KpiRow stats={stats} />

      <Card className="p-4">
        <h3 className="mb-2 text-sm font-semibold text-ink-900">Deal per stato</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.byStatus}>
              <XAxis dataKey="status" tick={{ fontSize: 10 }} interval={0} angle={-15} dy={10} height={50} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#171717" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="mb-2 text-sm font-semibold text-ink-900">Conversione per agente</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.perSales}>
              <XAxis dataKey="id" tick={{ fontSize: 10 }} />
              <YAxis unit="%" tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="conversion" fill="#dc2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-4 lg:col-span-2">
        <h3 className="mb-2 text-sm font-semibold text-ink-900">Bottleneck pipeline (gg medi)</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.ageByStatus} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="status" tick={{ fontSize: 10 }} width={140} />
              <Tooltip />
              <Bar dataKey="avgDays" fill="#525252" radius={[0, 4, 4, 0]}>
                {stats.ageByStatus.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function KpiRow({
  stats,
}: {
  stats: { winRate: number; wonValue: number; pipelineValue: number };
}) {
  return (
    <Card className="grid grid-cols-3 gap-4 p-4 lg:col-span-2">
      <Kpi label="Win rate" value={`${stats.winRate}%`} />
      <Kpi label="Valore vinto" value={formatEuro(stats.wonValue)} />
      <Kpi label="Valore in pipeline" value={formatEuro(stats.pipelineValue)} />
    </Card>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-ink-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-ink-900">{value}</div>
    </div>
  );
}
