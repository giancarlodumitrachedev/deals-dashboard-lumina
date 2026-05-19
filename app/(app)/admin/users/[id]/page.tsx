import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { UserDetail } from "./UserDetail";
import type { UserRole, DealStatus } from "@/lib/types/domain";

export const dynamic = "force-dynamic";

interface ProfileRow {
  id: string;
  full_name: string;
  email: string;
  is_active: boolean;
  created_at: string;
  role: { name: UserRole } | { name: UserRole }[] | null;
}

export default async function UserDetailPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  if (session.role !== "admin") redirect("/");

  const supabase = createSupabaseServerClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, is_active, created_at, role:roles(name)")
    .eq("id", params.id)
    .single<ProfileRow>();
  if (!profile) notFound();

  const role = (Array.isArray(profile.role) ? profile.role[0]?.name : profile.role?.name) as UserRole;

  const [{ data: deals }, { data: commissions }] = await Promise.all([
    supabase
      .from("deals")
      .select("id, client_name, value, status, created_at")
      .or(`assigned_sales_id.eq.${params.id},assigned_dev_id.eq.${params.id}`)
      .order("created_at", { ascending: false }),
    supabase
      .from("commissions")
      .select("id, amount, status, paid_at, created_at")
      .eq("user_id", params.id),
  ]);

  const wonDeals = (deals ?? []).filter((d) => d.status === "won");
  const cancelledDeals = (deals ?? []).filter((d) => d.status === "cancelled");
  const pipelineValue = (deals ?? [])
    .filter((d) => (["ready_to_pitch", "decision_pending", "payment_pending"] as DealStatus[]).includes(d.status))
    .reduce((s, d) => s + Number(d.value), 0);
  const conversion =
    wonDeals.length + cancelledDeals.length > 0
      ? Math.round((wonDeals.length / (wonDeals.length + cancelledDeals.length)) * 100)
      : 0;
  const totalCommissions = (commissions ?? []).reduce((s, c) => s + Number(c.amount), 0);
  const pendingCommissions = (commissions ?? [])
    .filter((c) => c.status === "pending")
    .reduce((s, c) => s + Number(c.amount), 0);

  return (
    <UserDetail
      user={{
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        is_active: profile.is_active,
        role,
        created_at: profile.created_at,
      }}
      selfId={session.userId}
      stats={{
        wonCount: wonDeals.length,
        cancelledCount: cancelledDeals.length,
        pipelineValue,
        conversion,
        totalCommissions,
        pendingCommissions,
      }}
      deals={deals ?? []}
    />
  );
}
