import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth";
import { ManagerInbox } from "./ManagerInbox";
import type { UserRole } from "@/lib/types/domain";

export const dynamic = "force-dynamic";

interface StaffRow {
  id: string;
  full_name: string;
  role: { name: UserRole } | { name: UserRole }[] | null;
}

export default async function ManagerPage() {
  await requireSession();
  const supabase = createSupabaseServerClient();

  const [{ data: deals }, { data: staffRaw }] = await Promise.all([
    supabase
      .from("deals")
      .select("id, client_name, phone_number, value, status, site_url, assigned_sales_id, assigned_dev_id, created_at")
      .eq("status", "new_lead")
      .order("created_at", { ascending: true }),
    supabase
      .from("profiles")
      .select("id, full_name, role:roles(name)")
      .eq("is_active", true),
  ]);

  const staff = (staffRaw ?? []).map((r: StaffRow) => ({
    id: r.id,
    full_name: r.full_name,
    role: Array.isArray(r.role) ? r.role[0]?.name : r.role?.name,
  }));

  const devs = staff.filter((s) => s.role === "developer");
  const salesAgents = staff.filter((s) => s.role === "sales");

  return (
    <ManagerInbox
      deals={deals ?? []}
      devs={devs.map((d) => ({ id: d.id, name: d.full_name }))}
      sales={salesAgents.map((s) => ({ id: s.id, name: s.full_name }))}
    />
  );
}
