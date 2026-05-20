import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DealDetail } from "./DealDetail";
import type { Deal, DealEvent, FollowUp, Commission, UserRole } from "@/lib/types/domain";

export const dynamic = "force-dynamic";

interface StaffRow {
  id: string;
  full_name: string;
  role: { name: UserRole } | { name: UserRole }[] | null;
}

export default async function DealDetailPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  if (session.role !== "admin" && session.role !== "manager") redirect("/");

  const supabase = createSupabaseServerClient();
  const [{ data: deal }, { data: events }, { data: followUps }, { data: commissions }, { data: staff }] =
    await Promise.all([
      supabase.from("deals").select("*").eq("id", params.id).single<Deal>(),
      supabase
        .from("deal_events")
        .select("id, deal_id, user_id, action_description, metadata, created_at")
        .eq("deal_id", params.id)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("follow_ups")
        .select("id, deal_id, step_number, scheduled_date, status, completed_at, created_at")
        .eq("deal_id", params.id)
        .order("step_number"),
      supabase
        .from("commissions")
        .select("id, deal_id, user_id, amount, status, paid_at, receipt_url, created_at")
        .eq("deal_id", params.id),
      supabase
        .from("profiles")
        .select("id, full_name, role:roles(name)")
        .eq("is_active", true),
    ]);

  if (!deal) notFound();

  const staffList = (staff ?? []).map((s: StaffRow) => ({
    id: s.id,
    name: s.full_name,
    role: (Array.isArray(s.role) ? s.role[0]?.name : s.role?.name) as UserRole,
  }));

  return (
    <DealDetail
      deal={deal}
      events={(events ?? []) as DealEvent[]}
      followUps={(followUps ?? []) as FollowUp[]}
      commissions={(commissions ?? []) as Commission[]}
      sales={staffList.filter((s) => s.role === "sales").map((s) => ({ id: s.id, name: s.name }))}
      devs={staffList.filter((s) => s.role === "developer").map((s) => ({ id: s.id, name: s.name }))}
    />
  );
}
