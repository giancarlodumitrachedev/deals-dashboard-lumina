import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DealsAdmin } from "./DealsAdmin";
import type { UserRole } from "@/lib/types/domain";

export const dynamic = "force-dynamic";

interface StaffRow {
  id: string;
  full_name: string;
  role: { name: UserRole } | { name: UserRole }[] | null;
}

interface DealJoinRow {
  id: string;
  client_name: string;
  value: number;
  status: string;
  site_url: string | null;
  created_at: string;
  updated_at: string;
  assigned_sales: { full_name: string } | { full_name: string }[] | null;
  assigned_dev: { full_name: string } | { full_name: string }[] | null;
}

export default async function DealsIndexPage() {
  const session = await requireSession();
  if (session.role !== "admin" && session.role !== "manager") redirect("/");

  const supabase = createSupabaseServerClient();
  const [{ data: deals }, { data: staff }] = await Promise.all([
    supabase
      .from("deals")
      .select(
        "id, client_name, value, status, site_url, created_at, updated_at, assigned_sales:profiles!deals_assigned_sales_id_fkey(full_name), assigned_dev:profiles!deals_assigned_dev_id_fkey(full_name)",
      )
      .order("updated_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("id, full_name, role:roles(name)")
      .eq("is_active", true),
  ]);

  const normalizedDeals = (deals ?? []).map((d: DealJoinRow) => ({
    id: d.id,
    client_name: d.client_name,
    value: d.value,
    status: d.status,
    site_url: d.site_url,
    created_at: d.created_at,
    updated_at: d.updated_at,
    sales: (Array.isArray(d.assigned_sales) ? d.assigned_sales[0]?.full_name : d.assigned_sales?.full_name) ?? null,
    dev: (Array.isArray(d.assigned_dev) ? d.assigned_dev[0]?.full_name : d.assigned_dev?.full_name) ?? null,
  }));

  const staffList = (staff ?? []).map((s: StaffRow) => ({
    id: s.id,
    name: s.full_name,
    role: (Array.isArray(s.role) ? s.role[0]?.name : s.role?.name) as UserRole,
  }));

  return <DealsAdmin deals={normalizedDeals} staff={staffList} />;
}
