"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { UI } from "@/lib/i18n/it";
import { useRealtimeDeals } from "@/components/useRealtimeDeals";

interface DevDeal {
  id: string;
  client_name: string;
  status: string;
  site_url: string | null;
}

export function DevQueue({ deals }: { deals: DevDeal[] }) {
  const router = useRouter();
  useRealtimeDeals(() => router.refresh());

  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <h1 className="text-lg font-semibold text-ink-900">In Sviluppo</h1>
      {deals.length === 0 ? (
        <Card className="p-8 text-center text-sm text-ink-500">{UI.empty.noDevQueue}</Card>
      ) : (
        deals.map((d) => <DevDealItem key={d.id} deal={d} />)
      )}
    </div>
  );
}

function DevDealItem({ deal }: { deal: DevDeal }) {
  const router = useRouter();
  const [url, setUrl] = useState(deal.site_url ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    setBusy(true);
    const res = await fetch(`/api/deals/${deal.id}/site-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ site_url: url.trim() }),
    });
    setBusy(false);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Errore" }));
      setError(error ?? "Errore");
      return;
    }
    router.refresh();
  }

  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium text-ink-900">{deal.client_name}</h3>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          type="url"
          placeholder="https://..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button onClick={submit} disabled={busy || url.trim().length === 0}>
          {busy ? "..." : UI.buttons.markReady}
        </Button>
      </div>
      {error && (
        <div className="mt-2 rounded-md border border-alert-ring bg-alert-soft px-3 py-1.5 text-xs text-alert">
          {error}
        </div>
      )}
    </Card>
  );
}
