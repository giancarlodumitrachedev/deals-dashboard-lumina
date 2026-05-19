import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CommissioniTab } from "../CommissioniTab";

export const dynamic = "force-dynamic";

interface CommissionJoinRow {
  id: string;
  amount: number;
  status: "pending" | "paid";
  paid_at: string | null;
  created_at: string;
  user_id: string;
  deal: { id: string; client_name: string; value: number } | { id: string; client_name: string; value: number }[] | null;
  user: { id: string; full_name: string } | { id: string; full_name: string }[] | null;
}

export default async function CommissionsPage() {
  const session = await requireSession();
  if (session.role !== "admin") redirect("/");

  const supabase = createSupabaseServerClient();
  const { data: raw } = await supabase
    .from("commissions")
    .select(
      "id, amount, status, paid_at, created_at, user_id, deal:deals(id, client_name, value), user:profiles(id, full_name)",
    )
    .order("created_at", { ascending: false });

  const commissions = (raw ?? []).map((c: CommissionJoinRow) => ({
    id: c.id,
    amount: Number(c.amount),
    status: c.status,
    paid_at: c.paid_at,
    created_at: c.created_at,
    deal: Array.isArray(c.deal) ? c.deal[0] : c.deal,
    user: Array.isArray(c.user) ? c.user[0] : c.user,
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Commissioni</h1>
      <CommissioniTab commissions={commissions} />
    </div>
  );
}
