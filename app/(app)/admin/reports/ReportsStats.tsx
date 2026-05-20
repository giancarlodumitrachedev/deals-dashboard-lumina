"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";
import { Card } from "@/components/ui/Card";
import { UI } from "@/lib/i18n/it";
import type { ReportType, ReportSeverity } from "@/lib/types/domain";

interface ReportRow {
  id: string;
  type: ReportType;
  severity: ReportSeverity;
  created_at: string;
  reporter: string;
}

const SEV_COLORS: Record<ReportSeverity, string> = {
  low: "#a3a3a3",
  medium: "#3b82f6",
  high: "#f59e0b",
  critical: "#dc2626",
};

export function ReportsStats({ reports }: { reports: ReportRow[] }) {
  const data = useMemo(() => {
    const total = reports.length;
    const bugs = reports.filter((r) => r.type === "bug").length;
    const improvements = total - bugs;
    const critical = reports.filter((r) => r.severity === "critical" || r.severity === "high").length;

    const sevCounts: Record<ReportSeverity, number> = { low: 0, medium: 0, high: 0, critical: 0 };
    for (const r of reports) sevCounts[r.severity]++;
    const bySeverity = (["low", "medium", "high", "critical"] as ReportSeverity[]).map((s) => ({
      key: s,
      label: { low: UI.report.sevLow, medium: UI.report.sevMedium, high: UI.report.sevHigh, critical: UI.report.sevCritical }[s],
      count: sevCounts[s],
    }));

    const byReporterMap: Record<string, { bug: number; improvement: number }> = {};
    for (const r of reports) {
      const e = (byReporterMap[r.reporter] ??= { bug: 0, improvement: 0 });
      e[r.type]++;
    }
    const byReporter = Object.entries(byReporterMap)
      .map(([name, c]) => ({ name, total: c.bug + c.improvement, bug: c.bug, improvement: c.improvement }))
      .sort((a, b) => b.total - a.total);

    return { total, bugs, improvements, critical, bySeverity, byReporter };
  }, [reports]);

  if (data.total === 0) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Totale" value={String(data.total)} />
        <Kpi label="Bug" value={String(data.bugs)} />
        <Kpi label="Miglioramenti" value={String(data.improvements)} />
        <Kpi label="Alta/Critica" value={String(data.critical)} tone={data.critical > 0 ? "alert" : "neutral"} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h3 className="mb-2 text-sm font-semibold">Per priorità</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.bySeverity}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "rgb(var(--text-muted))" }} />
                <YAxis tick={{ fontSize: 10, fill: "rgb(var(--text-muted))" }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "rgb(var(--bg-surface))", border: "1px solid rgb(var(--border))", borderRadius: 6, fontSize: 12 }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {data.bySeverity.map((d) => <Cell key={d.key} fill={SEV_COLORS[d.key]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="mb-2 text-sm font-semibold">Segnalazioni per utente</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byReporter} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 10, fill: "rgb(var(--text-muted))" }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "rgb(var(--text-muted))" }} width={110} />
                <Tooltip contentStyle={{ background: "rgb(var(--bg-surface))", border: "1px solid rgb(var(--border))", borderRadius: 6, fontSize: 12 }} />
                <Bar dataKey="bug" name="Bug" stackId="a" fill="#dc2626" radius={[0, 0, 0, 0]} />
                <Bar dataKey="improvement" name="Miglioramenti" stackId="a" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
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
      <div className={`mt-1 text-2xl font-semibold ${tone === "alert" ? "text-alert" : "text-primary"}`}>
        {value}
      </div>
    </Card>
  );
}
