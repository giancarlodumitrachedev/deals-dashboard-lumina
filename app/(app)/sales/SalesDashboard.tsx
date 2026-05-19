"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DEAL_STATUS_LABEL, UI } from "@/lib/i18n/it";
import { SALES_KANBAN_COLUMNS, type DealStatus, type DealWithRelations, type FollowUp } from "@/lib/types/domain";
import { formatEuro, isTodayOrPast } from "@/lib/utils";
import { ActionsToday } from "./ActionsToday";
import { StatTile } from "./StatTile";
import { useRealtimeDeals } from "@/components/useRealtimeDeals";

interface Props {
  deals: DealWithRelations[];
  followUps: FollowUp[];
  conversionRate: number;
  pendingCommissions: number;
}

export function SalesDashboard({ deals, followUps, conversionRate, pendingCommissions }: Props) {
  const router = useRouter();
  useRealtimeDeals(() => router.refresh());

  const [busy, setBusy] = useState(false);
  const actionableFollowUps = useMemo(
    () => followUps.filter((f) => isTodayOrPast(f.scheduled_date)),
    [followUps],
  );

  const byColumn = useMemo(() => {
    const buckets: Record<DealStatus, DealWithRelations[]> = {
      new_lead: [],
      in_development: [],
      ready_to_pitch: [],
      decision_pending: [],
      payment_pending: [],
      won: [],
      cancelled: [],
    };
    for (const d of deals) buckets[d.status].push(d);
    return buckets;
  }, [deals]);

  async function onDragEnd(result: DropResult) {
    if (!result.destination) return;
    const dealId = result.draggableId;
    const from = result.source.droppableId as DealStatus;
    const to = result.destination.droppableId as DealStatus;
    if (from === to) return;

    setBusy(true);
    const res = await fetch(`/api/deals/${dealId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: to }),
    });
    setBusy(false);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Errore" }));
      alert(error ?? "Errore");
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile label={UI.stats.conversionRate} value={`${conversionRate}%`} />
        <StatTile label={UI.stats.pendingCommissions} value={formatEuro(pendingCommissions)} />
        <StatTile
          label={UI.actionsToday}
          value={String(actionableFollowUps.length)}
          tone={actionableFollowUps.length > 0 ? "alert" : "neutral"}
        />
      </section>

      <ActionsToday deals={deals} followUps={actionableFollowUps} />

      <DragDropContext onDragEnd={onDragEnd}>
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {SALES_KANBAN_COLUMNS.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              deals={byColumn[status]}
              busy={busy}
            />
          ))}
        </section>
      </DragDropContext>
    </div>
  );
}

function KanbanColumn({
  status,
  deals,
  busy,
}: {
  status: DealStatus;
  deals: DealWithRelations[];
  busy: boolean;
}) {
  return (
    <Droppable droppableId={status}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`flex min-h-[120px] flex-col gap-2 rounded-lg border border-line bg-surface p-3 transition-colors ${
            snapshot.isDraggingOver ? "border-faint bg-base" : ""
          } ${busy ? "opacity-60" : ""}`}
        >
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-primary">{DEAL_STATUS_LABEL[status]}</h2>
            <Badge tone="muted">{deals.length}</Badge>
          </div>

          {deals.length === 0 && (
            <div className="rounded-md border border-dashed border-line px-3 py-6 text-center text-xs text-faint">
              {UI.empty.noDeals}
            </div>
          )}

          {deals.map((deal, idx) => (
            <Draggable key={deal.id} draggableId={deal.id} index={idx}>
              {(prov, snap) => (
                <div
                  ref={prov.innerRef}
                  {...prov.draggableProps}
                  {...prov.dragHandleProps}
                  className={`rounded-md border border-line bg-surface p-3 text-left shadow-card transition ${
                    snap.isDragging ? "ring-2 ring-primary/10" : ""
                  }`}
                >
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <span className="text-sm font-medium text-primary">{deal.client_name}</span>
                    <span className="whitespace-nowrap text-xs text-muted">
                      {formatEuro(deal.value)}
                    </span>
                  </div>
                  {deal.site_url && (
                    <a
                      href={deal.site_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate text-xs text-muted hover:text-primary"
                    >
                      {deal.site_url}
                    </a>
                  )}
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}

export { Card };
