"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { Badge } from "@/components/ui/Badge";
import { DEAL_STATUS_LABEL } from "@/lib/i18n/it";
import { DEAL_STATUSES, type DealStatus } from "@/lib/types/domain";
import { formatEuro } from "@/lib/utils";
import { useRealtimeDeals } from "@/components/useRealtimeDeals";

export interface AdminKanbanDeal {
  id: string;
  client_name: string;
  value: number;
  status: DealStatus;
  job: string | null;
  notes: string | null;
  site_url: string | null;
  created_at: string;
  sales: string | null;
  dev: string | null;
}

const COLUMN_ACCENT: Record<DealStatus, string> = {
  new_lead: "text-muted",
  in_development: "text-muted",
  ready_to_pitch: "text-blue-600 dark:text-blue-400",
  decision_pending: "text-amber-600 dark:text-amber-400",
  payment_pending: "text-purple-600 dark:text-purple-400",
  won: "text-emerald-600 dark:text-emerald-400",
  cancelled: "text-alert",
};

export function AdminKanban({ deals }: { deals: AdminKanbanDeal[] }) {
  const router = useRouter();
  const [items, setItems] = useState<AdminKanbanDeal[]>(deals);
  useEffect(() => setItems(deals), [deals]);
  useRealtimeDeals(() => router.refresh());

  const byColumn = useMemo(() => {
    const buckets: Record<DealStatus, AdminKanbanDeal[]> = {
      new_lead: [], in_development: [], ready_to_pitch: [],
      decision_pending: [], payment_pending: [], won: [], cancelled: [],
    };
    for (const d of items) buckets[d.status].push(d);
    return buckets;
  }, [items]);

  async function onDragEnd(result: DropResult) {
    if (!result.destination) return;
    const id = result.draggableId;
    const from = result.source.droppableId as DealStatus;
    const to = result.destination.droppableId as DealStatus;
    if (from === to) return;

    const prev = items;
    setItems((cur) => cur.map((d) => (d.id === id ? { ...d, status: to } : d)));
    const res = await fetch(`/api/deals/${id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: to }),
    });
    if (!res.ok) {
      setItems(prev);
      const { error } = await res.json().catch(() => ({ error: "Errore" }));
      alert(error ?? "Errore");
      return;
    }
    router.refresh();
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {DEAL_STATUSES.map((status) => (
          <Droppable droppableId={status} key={status}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex w-72 shrink-0 flex-col gap-2 rounded-lg border border-line bg-surface p-3 transition-colors ${
                  snapshot.isDraggingOver ? "border-faint bg-base" : ""
                }`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <h2 className={`text-sm font-semibold ${COLUMN_ACCENT[status]}`}>
                    {DEAL_STATUS_LABEL[status]}
                  </h2>
                  <Badge tone="muted">{byColumn[status].length}</Badge>
                </div>

                {byColumn[status].length === 0 && (
                  <div className="rounded-md border border-dashed border-line px-3 py-6 text-center text-xs text-faint">
                    —
                  </div>
                )}

                {byColumn[status].map((deal, idx) => (
                  <Draggable draggableId={deal.id} index={idx} key={deal.id}>
                    {(prov, snap) => (
                      <div
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                        {...prov.dragHandleProps}
                        onClick={() => {
                          if (snap.isDragging) return;
                          router.push(`/admin/deals/${deal.id}`);
                        }}
                        className={`group cursor-pointer rounded-md border border-line bg-surface p-3 text-left shadow-card transition duration-150 hover:-translate-y-0.5 hover:border-faint hover:shadow-md ${
                          snap.isDragging ? "rotate-1 ring-2 ring-primary/10" : ""
                        }`}
                      >
                        <div className="mb-1 flex items-start justify-between gap-2">
                          <span className="text-sm font-medium text-primary group-hover:underline">
                            {deal.client_name}
                          </span>
                          <span className="whitespace-nowrap text-xs text-muted">{formatEuro(deal.value)}</span>
                        </div>
                        {deal.job && <div className="text-[11px] text-faint">{deal.job}</div>}
                        {deal.notes && (
                          <p className="mt-1 line-clamp-2 text-[11px] text-muted">{deal.notes}</p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-1">
                          {deal.sales && <Badge tone="neutral">A: {deal.sales}</Badge>}
                          {deal.dev && <Badge tone="muted">D: {deal.dev}</Badge>}
                          {!deal.sales && !deal.dev && (
                            <span className="text-[11px] text-faint">Non assegnato</span>
                          )}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}
