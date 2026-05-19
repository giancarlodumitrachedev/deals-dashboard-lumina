"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { UI } from "@/lib/i18n/it";
import type { Deal } from "@/lib/types/domain";

interface ReadyDeal {
  id: string;
  client_name: string;
  site_url: string | null;
}

// Banner shown to a Sales agent whenever a deal assigned to them is in `ready_to_pitch`.
// Includes one-click copyable WhatsApp message.
export function HandoffBanner({ userId }: { userId: string }) {
  const [deals, setDeals] = useState<ReadyDeal[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const load = async () => {
      const { data } = await supabase
        .from("deals")
        .select("id, client_name, site_url")
        .eq("assigned_sales_id", userId)
        .eq("status", "ready_to_pitch");
      setDeals((data ?? []) as ReadyDeal[]);
    };
    load();

    const channel = supabase
      .channel("handoff-banner")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "deals", filter: `assigned_sales_id=eq.${userId}` },
        load,
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  if (deals.length === 0) return null;

  return (
    <div className="border-b border-alert-ring bg-alert-soft">
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-2 px-6 py-2">
        {deals.map((d) => (
          <div key={d.id} className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-alert" />
              <span className="text-sm font-medium text-alert">
                {UI.notifications.siteReady(d.client_name)}
              </span>
              {d.site_url && (
                <a
                  href={d.site_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-xs text-alert/80 underline-offset-2 hover:underline"
                >
                  {d.site_url}
                </a>
              )}
            </div>
            {d.site_url && (
              <button
                className="rounded-md border border-alert-ring bg-white px-3 py-1 text-xs font-medium text-alert hover:bg-alert hover:text-white"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      UI.notifications.whatsappTemplate(d.client_name, d.site_url!),
                    );
                    setCopied(d.id);
                    setTimeout(() => setCopied((c) => (c === d.id ? null : c)), 2000);
                  } catch {}
                }}
              >
                {copied === d.id ? UI.buttons.copied : UI.buttons.copy}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
