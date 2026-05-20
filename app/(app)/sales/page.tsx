import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth";
import { SalesDashboard } from "./SalesDashboard";
import type { DealWithRelations, FollowUp, Commission } from "@/lib/types/domain";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const session = await requireSession();
  const supabase = createSupabaseServerClient();

  const [{ data: deals }, { data: followUps }, { data: commissions }] = await Promise.all([
    supabase
      .from("deals")
      .select(
        "id, client_name, phone_number, email, website, job, value, status, assigned_sales_id, assigned_dev_id, site_url, notes, created_at, updated_at",
      )
      .eq("assigned_sales_id", session.userId)
      .in("status", ["ready_to_pitch", "decision_pending", "payment_pending", "won", "cancelled"])
      .order("updated_at", { ascending: false }),
    supabase
      .from("follow_ups")
      .select("id, deal_id, step_number, scheduled_date, status, completed_at, created_at")
      .eq("status", "pending"),
    supabase
      .from("commissions")
      .select("id, deal_id, user_id, amount, status, paid_at, receipt_url, created_at")
      .eq("user_id", session.userId),
  ]);

  // Compute conversion rate from sales-history (won vs cancelled+won)
  const { count: wonCount } = await supabase
    .from("deals")
    .select("id", { count: "exact", head: true })
    .eq("assigned_sales_id", session.userId)
    .eq("status", "won");

  const { count: closedCount } = await supabase
    .from("deals")
    .select("id", { count: "exact", head: true })
    .eq("assigned_sales_id", session.userId)
    .in("status", ["won", "cancelled"]);

  const conversion = closedCount && closedCount > 0
    ? Math.round(((wonCount ?? 0) / closedCount) * 100)
    : 0;

  const pendingCommissions = (commissions ?? [])
    .filter((c: Commission) => c.status === "pending")
    .reduce((sum: number, c: Commission) => sum + Number(c.amount), 0);

  return (
    <SalesDashboard
      deals={(deals ?? []) as DealWithRelations[]}
      followUps={(followUps ?? []) as FollowUp[]}
      conversionRate={conversion}
      pendingCommissions={pendingCommissions}
    />
  );
}
