import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PersonalAnalytics } from "./PersonalAnalytics";
import type { DealStatus } from "@/lib/types/domain";

export const dynamic = "force-dynamic";

interface DealRow {
  id: string;
  value: number;
  status: DealStatus;
  created_at: string;
  updated_at: string;
}

export default async function MyAnalyticsPage() {
  const session = await requireSession();
  // Admin already has the global analytics dashboard.
  if (session.role === "admin") redirect("/admin/analytics");

  const supabase = createSupabaseServerClient();

  // RLS guarantees a non-admin only receives their own deals here.
  const { data: deals } = await supabase
    .from("deals")
    .select("id, value, status, created_at, updated_at")
    .order("created_at", { ascending: false });

  const { data: commissions } = await supabase
    .from("commissions")
    .select("amount, status")
    .eq("user_id", session.userId);

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Le mie analitiche</h1>
      <PersonalAnalytics
        deals={(deals ?? []) as DealRow[]}
        commissions={(commissions ?? []) as { amount: number; status: "pending" | "paid" }[]}
        role={session.role}
      />
    </div>
  );
}
