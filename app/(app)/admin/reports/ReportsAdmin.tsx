"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { UI } from "@/lib/i18n/it";
import type { ReportType, ReportSeverity } from "@/lib/types/domain";

interface ReportRow {
  id: string;
  type: ReportType;
  severity: ReportSeverity;
  description: string;
  created_at: string;
  reporter: string;
}

const TYPE_LABEL: Record<ReportType, string> = {
  bug: UI.report.typeBug,
  improvement: UI.report.typeImprovement,
};

const SEV_LABEL: Record<ReportSeverity, string> = {
  low: UI.report.sevLow,
  medium: UI.report.sevMedium,
  high: UI.report.sevHigh,
  critical: UI.report.sevCritical,
};

const SEV_TONE: Record<ReportSeverity, "muted" | "neutral" | "alert"> = {
  low: "muted",
  medium: "neutral",
  high: "alert",
  critical: "alert",
};

const SEV_RANK: Record<ReportSeverity, number> = { critical: 3, high: 2, medium: 1, low: 0 };

export function ReportsAdmin({ reports }: { reports: ReportRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<"" | ReportType>("");

  const sorted = useMemo(() => {
    return reports
      .filter((r) => !typeFilter || r.type === typeFilter)
      .sort((a, b) => SEV_RANK[b.severity] - SEV_RANK[a.severity] ||
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [reports, typeFilter]);

  async function remove(id: string) {
    if (!confirm("Eliminare questa segnalazione?")) return;
    setBusy(id);
    const res = await fetch(`/api/reports/${id}`, { method: "DELETE" });
    setBusy(null);
    if (!res.ok) { alert("Errore"); return; }
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as "" | ReportType)}
          className="max-w-xs"
        >
          <option value="">Tutti i tipi</option>
          <option value="bug">{UI.report.typeBug}</option>
          <option value="improvement">{UI.report.typeImprovement}</option>
        </Select>
        <div className="ml-auto text-xs text-muted">{sorted.length} segnalazioni</div>
      </div>

      {sorted.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted">Nessuna segnalazione.</Card>
      ) : (
        <div className="space-y-2">
          {sorted.map((r) => (
            <Card key={r.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Badge tone={r.type === "bug" ? "alert" : "neutral"}>{TYPE_LABEL[r.type]}</Badge>
                    <Badge tone={SEV_TONE[r.severity]}>{SEV_LABEL[r.severity]}</Badge>
                    <span className="text-xs text-muted">{r.reporter}</span>
                    <span className="text-xs text-faint">
                      {new Date(r.created_at).toLocaleString("it-IT")}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-primary">{r.description}</p>
                </div>
                <Button
                  size="sm"
                  variant="danger"
                  disabled={busy === r.id}
                  onClick={() => remove(r.id)}
                >
                  {busy === r.id ? "..." : "Elimina"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
