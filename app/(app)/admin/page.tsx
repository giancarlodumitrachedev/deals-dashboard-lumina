import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminKanban, type AdminKanbanDeal } from "./AdminKanban";

export const dynamic = "force-dynamic";

interface DealJoinRow {
  id: string;
  client_name: string;
  value: number;
  status: AdminKanbanDeal["status"];
  job: string | null;
  notes: string | null;
  site_url: string | null;
  created_at: string;
  assigned_sales: { full_name: string } | { full_name: string }[] | null;
  assigned_dev: { full_name: string } | { full_name: string }[] | null;
}

export default async function AdminHome() {
  const session = await requireSession();
  if (session.role !== "admin") redirect("/");

  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("deals")
    .select(
      "id, client_name, value, status, job, notes, site_url, created_at, assigned_sales:profiles!deals_assigned_sales_id_fkey(full_name), assigned_dev:profiles!deals_assigned_dev_id_fkey(full_name)",
    )
    .order("created_at", { ascending: false });

  const deals: AdminKanbanDeal[] = (data ?? []).map((d: DealJoinRow) => ({
    id: d.id,
    client_name: d.client_name,
    value: d.value,
    status: d.status,
    job: d.job,
    notes: d.notes,
    site_url: d.site_url,
    created_at: d.created_at,
    sales: (Array.isArray(d.assigned_sales) ? d.assigned_sales[0]?.full_name : d.assigned_sales?.full_name) ?? null,
    dev: (Array.isArray(d.assigned_dev) ? d.assigned_dev[0]?.full_name : d.assigned_dev?.full_name) ?? null,
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Operatività</h1>
      <AdminKanban deals={deals} />
    </div>
  );
}
