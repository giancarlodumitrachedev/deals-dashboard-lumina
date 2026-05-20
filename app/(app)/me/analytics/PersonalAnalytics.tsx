"use client";

import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid, Legend,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { DEAL_STATUS_LABEL } from "@/lib/i18n/it";
import { DEAL_STATUSES, type DealStatus, type UserRole } from "@/lib/types/domain";
import { formatEuro } from "@/lib/utils";

const STATUS_COLORS: Record<DealStatus, string> = {
  new_lead: "#737373",
  in_development: "#525252",
  ready_to_pitch: "#3b82f6",
  decision_pending: "#f59e0b",
  payment_pending: "#a855f7",
  won: "#10b981",
  cancelled: "#dc2626",
};

interface DealRow {
  id: string;
  value: number;
  status: DealStatus;
  created_at: string;
  updated_at: string;
}

export function PersonalAnalytics({
  deals,
  commissions,
  role,
}: {
  deals: DealRow[];
  commissions: { amount: number; status: "pending" | "paid" }[];
  role: UserRole;
}) {
  const data = useMemo(() => {
    const won = deals.filter((d) => d.status === "won");
    const cancelled = deals.filter((d) => d.status === "cancelled");
    const closed = won.length + cancelled.length;
    const winRate = closed > 0 ? Math.round((won.length / closed) * 100) : 0;
    const wonValue = won.reduce((s, d) => s + Number(d.value), 0);
    const pipelineValue = deals
      .filter((d) => (["ready_to_pitch", "decision_pending", "payment_pending"] as DealStatus[]).includes(d.status))
      .reduce((s, d) => s + Number(d.value), 0);

    const byStatus = DEAL_STATUSES.map((s) => ({
      status: DEAL_STATUS_LABEL[s],
      key: s,
      count: deals.filter((d) => d.status === s).length,
    }));

    const weeks: { label: string; nuovi: number; vinti: number }[] = [];
    const now = new Date();
    const monday = new Date(now);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    for (let i = 11; i >= 0; i--) {
      const start = new Date(monday);
      start.setDate(monday.getDate() - i * 7);
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      let nuovi = 0, vinti = 0;
      for (const d of deals) {
        const created = new Date(d.created_at).getTime();
        if (created >= start.getTime() && created < end.getTime()) nuovi++;
        if (d.status === "won") {
          const updated = new Date(d.updated_at).getTime();
          if (updated >= start.getTime() && updated < end.getTime()) vinti++;
        }
      }
      weeks.push({ label: `${start.getDate()}/${start.getMonth() + 1}`, nuovi, vinti });
    }

    const pendingComm = commissions.filter((c) => c.status === "pending").reduce((s, c) => s + Number(c.amount), 0);
    const paidComm = commissions.filter((c) => c.status === "paid").reduce((s, c) => s + Number(c.amount), 0);

    return { winRate, wonValue, pipelineValue, byStatus, weeks, wonCount: won.length, pendingComm, paidComm };
  }, [deals, commissions]);

  const isSales = role === "sales";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Deal vinti" value={String(data.wonCount)} />
        <Kpi label="Tasso conversione" value={`${data.winRate}%`} />
        <Kpi label="Valore vinto" value={formatEuro(data.wonValue)} />
        {isSales ? (
          <Kpi label="Commissioni da ricevere" value={formatEuro(data.pendingComm)} tone="alert" />
        ) : (
          <Kpi label="Valore pipeline" value={formatEuro(data.pipelineValue)} />
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h3 className="mb-2 text-sm font-semibold">I miei deal per stato</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
                <XAxis dataKey="status" tick={{ fontSize: 10, fill: "rgb(var(--text-muted))" }} interval={0} angle={-15} dy={10} height={50} />
                <YAxis tick={{ fontSize: 10, fill: "rgb(var(--text-muted))" }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "rgb(var(--bg-surface))", border: "1px solid rgb(var(--border))", borderRadius: 6, fontSize: 12 }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {data.byStatus.map((d) => <Cell key={d.key} fill={STATUS_COLORS[d.key]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="mb-2 text-sm font-semibold">12 settimane</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.weeks}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "rgb(var(--text-muted))" }} />
                <YAxis tick={{ fontSize: 10, fill: "rgb(var(--text-muted))" }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "rgb(var(--bg-surface))", border: "1px solid rgb(var(--border))", borderRadius: 6, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="nuovi" name="Nuovi" stroke="#737373" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="vinti" name="Vinti" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Kpi({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "alert" }) {
  return (
    <Card className="p-4">
      <div className="text-xs uppercase tracking-wider text-muted">{label}</div>
      <div className={`mt-1 text-xl font-semibold ${tone === "alert" ? "text-alert" : "text-primary"}`}>
        {value}
      </div>
    </Card>
  );
}
