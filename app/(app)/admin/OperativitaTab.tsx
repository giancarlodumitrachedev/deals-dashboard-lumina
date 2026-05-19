"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
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

export function OperativitaTab({ deals }: { deals: AdminDealSummary[] }) {
  const buckets = useMemo(() => {
    const out: Record<DealStatus, AdminDealSummary[]> = {
      new_lead: [], in_development: [], ready_to_pitch: [],
      decision_pending: [], payment_pending: [], won: [], cancelled: [],
    };
    for (const d of deals) out[d.status].push(d);
    return out;
  }, [deals]);

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-7">
      {DEAL_STATUSES.map((s) => (
        <Card key={s} className="flex flex-col gap-2 p-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
              {DEAL_STATUS_LABEL[s]}
            </h3>
            <Badge tone="muted">{buckets[s].length}</Badge>
          </div>
          {buckets[s].length === 0 ? (
            <div className="rounded-md border border-dashed border-line p-3 text-center text-xs text-faint">
              —
            </div>
          ) : (
            buckets[s].slice(0, 6).map((d) => (
              <div key={d.id} className="rounded-md border border-line bg-surface-2 p-2">
                <div className="text-xs font-medium text-primary">{d.client_name}</div>
                <div className="text-[11px] text-muted">{formatEuro(d.value)}</div>
              </div>
            ))
          )}
          {buckets[s].length > 6 && (
            <div className="text-center text-[11px] text-faint">
              +{buckets[s].length - 6}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
