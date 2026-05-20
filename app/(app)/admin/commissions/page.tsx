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
  receipt_url: string | null;
  created_at: string;
  user_id: string;
  deal: { id: string; client_name: string; value: number } | { id: string; client_name: string; value: number }[] | null;
  user:
    | { id: string; full_name: string; iban: string | null; payment_method: string | null }
    | { id: string; full_name: string; iban: string | null; payment_method: string | null }[]
    | null;
}

export default async function CommissionsPage() {
  const session = await requireSession();
  if (session.role !== "admin") redirect("/");

  const supabase = createSupabaseServerClient();
  const { data: raw } = await supabase
    .from("commissions")
    .select(
      "id, amount, status, paid_at, receipt_url, created_at, user_id, deal:deals(id, client_name, value), user:profiles(id, full_name, iban, payment_method)",
    )
    .order("created_at", { ascending: false });

  const commissions = (raw ?? []).map((c: CommissionJoinRow) => {
    const user = Array.isArray(c.user) ? c.user[0] : c.user;
    return {
      id: c.id,
      amount: Number(c.amount),
      status: c.status,
      paid_at: c.paid_at,
      receipt_url: c.receipt_url,
      created_at: c.created_at,
      deal: Array.isArray(c.deal) ? c.deal[0] : c.deal,
      user: user ? { id: user.id, full_name: user.full_name } : null,
      iban: user?.iban ?? null,
      payment_method: user?.payment_method ?? null,
    };
  });

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Commissioni</h1>
      <CommissioniTab commissions={commissions} />
    </div>
  );
}
