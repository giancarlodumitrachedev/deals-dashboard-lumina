"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { UI } from "@/lib/i18n/it";
import type { DealWithRelations, FollowUp } from "@/lib/types/domain";

export function ActionsToday({
  deals,
  followUps,
}: {
  deals: DealWithRelations[];
  followUps: FollowUp[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  const dealMap = new Map(deals.map((d) => [d.id, d]));
  const items = followUps
    .map((f) => ({ followUp: f, deal: dealMap.get(f.deal_id) }))
    .filter((x): x is { followUp: FollowUp; deal: DealWithRelations } => Boolean(x.deal));

  async function markDone(id: string) {
    setBusy(id);
    const res = await fetch(`/api/follow-ups/${id}/done`, { method: "POST" });
    setBusy(null);
    if (!res.ok) alert("Errore");
    router.refresh();
  }

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-primary">{UI.actionsToday}</h2>
        {items.length > 0 && <Badge tone="alert">{items.length}</Badge>}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted">{UI.empty.noActions}</p>
      ) : (
        <ul className="divide-y divide-line">
          {items.map(({ followUp, deal }) => (
            <li key={followUp.id} className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm font-medium text-primary">{deal.client_name}</div>
                <div className="text-xs text-muted">
                  Follow-up #{followUp.step_number} · {new Date(followUp.scheduled_date).toLocaleDateString("it-IT")}
                </div>
              </div>
              <Button
                size="sm"
                variant="secondary"
                disabled={busy === followUp.id}
                onClick={() => markDone(followUp.id)}
              >
                {busy === followUp.id ? "..." : UI.buttons.done}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
