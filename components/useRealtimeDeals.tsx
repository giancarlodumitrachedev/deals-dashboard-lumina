"use client";

import { useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// Subscribe to deal + follow_up changes so the user's view refreshes on remote updates.
export function useRealtimeDeals(onChange: () => void) {
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel("lumina-crm")
      .on("postgres_changes", { event: "*", schema: "public", table: "deals" }, onChange)
      .on("postgres_changes", { event: "*", schema: "public", table: "follow_ups" }, onChange)
      .on("postgres_changes", { event: "*", schema: "public", table: "commissions" }, onChange)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [onChange]);
}
