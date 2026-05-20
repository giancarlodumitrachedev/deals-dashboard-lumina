"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid, Legend,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { DEAL_STATUS_LABEL } from "@/lib/i18n/it";
import { DEAL_STATUSES, type DealStatus } from "@/lib/types/domain";
import { formatEuro } from "@/lib/utils";

export interface AdminDealSummary {
  id: string;
  client_name: string;
  value: number;
  status: DealStatus;
  assigned_sales_id: string | null;
  assigned_dev_id: string | null;
  site_url: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_COLORS: Record<DealStatus, string> = {
  new_lead: "#737373",
  in_development: "#525252",
  ready_to_pitch: "#3b82f6",
  decision_pending: "#f59e0b",
  payment_pending: "#a855f7",
  won: "#10b981",
  cancelled: "#dc2626",
};

export function AnaliticheTab({
  deals,
  salesNames,
}: {
  deals: AdminDealSummary[];
  salesNames: Map<string, string>;
}) {
  const data = useMemo(() => {
    const won = deals.filter((d) => d.status === "won");
    const cancelled = deals.filter((d) => d.status === "cancelled");
    const total = won.length + cancelled.length;
    const winRate = total > 0 ? Math.round((won.length / total) * 100) : 0;
    const wonValue = won.reduce((s, d) => s + Number(d.value), 0);
    const pipelineValue = deals
      .filter((d) => (["ready_to_pitch", "decision_pending", "payment_pending"] as DealStatus[]).includes(d.status))
      .reduce((s, d) => s + Number(d.value), 0);
    const avgDealValue = won.length > 0 ? wonValue / won.length : 0;

    const byStatus = DEAL_STATUSES.map((s) => ({
      status: DEAL_STATUS_LABEL[s],
      key: s,
      count: deals.filter((d) => d.status === s).length,
    }));

    // Funnel: count of deals that ever reached or passed each stage.
    // Approximated by current status + winning/cancellation history-implied progression.
    const funnelStages: DealStatus[] = [
      "new_lead", "in_development", "ready_to_pitch", "decision_pending", "payment_pending", "won",
    ];
    const stageRank = new Map(funnelStages.map((s, i) => [s, i]));
    const funnel = funnelStages.map((s) => {
      const sIdx = stageRank.get(s)!;
      const count = deals.filter((d) => {
        if (d.status === "cancelled") return false;
        const idx = stageRank.get(d.status);
        return idx !== undefined && idx >= sIdx;
      }).length;
      return { stage: DEAL_STATUS_LABEL[s], count };
    });

    // Leaderboard: per-sales stats
    const bySales: Record<string, { id: string; won: number; pitched: number; value: number }> = {};
    for (const d of deals) {
      if (!d.assigned_sales_id) continue;
      const r = (bySales[d.assigned_sales_id] ??= {
        id: d.assigned_sales_id, won: 0, pitched: 0, value: 0,
      });
      if (d.status === "won") {
        r.won += 1;
        r.value += Number(d.value);
      }
      if ((["ready_to_pitch", "decision_pending", "payment_pending", "won", "cancelled"] as DealStatus[]).includes(d.status)) {
        r.pitched += 1;
      }
    }
    const leaderboard = Object.values(bySales)
      .map((r) => ({
        id: r.id,
        name: salesNames.get(r.id) ?? r.id.slice(0, 8),
        won: r.won,
        pitched: r.pitched,
        value: r.value,
        conversion: r.pitched > 0 ? Math.round((r.won / r.pitched) * 100) : 0,
      }))
      .sort((a, b) => b.value - a.value || b.won - a.won);

    // 12-week time series: new leads vs won deals
    const weeks: { label: string; leads: number; won: number; startMs: number }[] = [];
    const now = new Date();
    const monday = new Date(now);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // last Monday
    for (let i = 11; i >= 0; i--) {
      const start = new Date(monday);
      start.setDate(monday.getDate() - i * 7);
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      weeks.push({
        label: `${start.getDate()}/${start.getMonth() + 1}`,
        leads: 0,
        won: 0,
        startMs: start.getTime(),
      });
      for (const d of deals) {
        const created = new Date(d.created_at).getTime();
        if (created >= start.getTime() && created < end.getTime()) weeks[weeks.length - 1].leads++;
        if (d.status === "won") {
          const updated = new Date(d.updated_at).getTime();
          if (updated >= start.getTime() && updated < end.getTime()) weeks[weeks.length - 1].won++;
        }
      }
    }

    // Bottleneck: avg age per status
    const ageByStatus = DEAL_STATUSES.map((s) => {
      const ds = deals.filter((d) => d.status === s);
      const avg = ds.length === 0 ? 0 :
        Math.round(ds.reduce((sum, d) => sum + (Date.now() - new Date(d.updated_at).getTime()) / 86400000, 0) / ds.length);
      return { status: DEAL_STATUS_LABEL[s], key: s, days: avg };
    });

    return { winRate, wonValue, pipelineValue, avgDealValue, byStatus, funnel, leaderboard, weeks, ageByStatus };
  }, [deals, salesNames]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Win rate" value={`${data.winRate}%`} />
        <Kpi label="Valore vinto" value={formatEuro(data.wonValue)} />
        <Kpi label="Pipeline" value={formatEuro(data.pipelineValue)} />
        <Kpi label="Valore medio deal" value={formatEuro(data.avgDealValue)} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h3 className="mb-2 text-sm font-semibold">Deal per stato</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
                <XAxis dataKey="status" tick={{ fontSize: 10, fill: "rgb(var(--text-muted))" }} interval={0} angle={-15} dy={10} height={50} />
                <YAxis tick={{ fontSize: 10, fill: "rgb(var(--text-muted))" }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "rgb(var(--bg-surface))", border: "1px solid rgb(var(--border))", borderRadius: 6, fontSize: 12 }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {data.byStatus.map((d) => (
                    <Cell key={d.key} fill={STATUS_COLORS[d.key]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="mb-2 text-sm font-semibold">Funnel pipeline</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.funnel} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 10, fill: "rgb(var(--text-muted))" }} />
                <YAxis type="category" dataKey="stage" tick={{ fontSize: 10, fill: "rgb(var(--text-muted))" }} width={140} />
                <Tooltip contentStyle={{ background: "rgb(var(--bg-surface))", border: "1px solid rgb(var(--border))", borderRadius: 6, fontSize: 12 }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4 lg:col-span-2">
          <h3 className="mb-2 text-sm font-semibold">12 settimane: nuovi lead vs vinti</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.weeks}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "rgb(var(--text-muted))" }} />
                <YAxis tick={{ fontSize: 10, fill: "rgb(var(--text-muted))" }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "rgb(var(--bg-surface))", border: "1px solid rgb(var(--border))", borderRadius: 6, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="leads" name="Nuovi lead" stroke="#737373" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="won" name="Vinti" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4 lg:col-span-2">
          <h3 className="mb-2 text-sm font-semibold">Bottleneck pipeline (giorni medi nello stato)</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.ageByStatus} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 10, fill: "rgb(var(--text-muted))" }} />
                <YAxis type="category" dataKey="status" tick={{ fontSize: 10, fill: "rgb(var(--text-muted))" }} width={140} />
                <Tooltip contentStyle={{ background: "rgb(var(--bg-surface))", border: "1px solid rgb(var(--border))", borderRadius: 6, fontSize: 12 }} />
                <Bar dataKey="days" radius={[0, 4, 4, 0]}>
                  {data.ageByStatus.map((d) => (
                    <Cell key={d.key} fill={STATUS_COLORS[d.key]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold">Classifica agenti</h3>
        {data.leaderboard.length === 0 ? (
          <p className="text-sm text-muted">Nessun agente assegnato.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="py-2 font-medium">Agente</th>
                  <th className="py-2 font-medium">Deal vinti</th>
                  <th className="py-2 font-medium">Valore</th>
                  <th className="py-2 font-medium">Tasso conv.</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.leaderboard.map((row, i) => (
                  <tr key={row.id}>
                    <td className="py-2">
                      <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-surface-2 text-[10px] font-semibold text-muted">
                        {i + 1}
                      </span>
                      {row.name}
                    </td>
                    <td className="py-2 text-primary">{row.won}</td>
                    <td className="py-2 text-primary">{formatEuro(row.value)}</td>
                    <td className="py-2 text-primary">{row.conversion}%</td>
                    <td className="py-2 text-right">
                      <Link href={`/admin/users/${row.id}`} className="text-xs text-muted hover:text-primary">
                        Profilo →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <div className="text-xs uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-1 text-xl font-semibold text-primary">{value}</div>
    </Card>
  );
}
