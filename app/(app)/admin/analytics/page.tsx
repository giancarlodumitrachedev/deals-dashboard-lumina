import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AnaliticheTab } from "../AnaliticheTab";
import type { UserRole } from "@/lib/types/domain";

export const dynamic = "force-dynamic";

interface StaffRow {
  id: string;
  full_name: string;
  role: { name: UserRole } | { name: UserRole }[] | null;
}

export default async function AnalyticsPage() {
  const session = await requireSession();
  if (session.role !== "admin") redirect("/");

  const supabase = createSupabaseServerClient();
  const [{ data: deals }, { data: staff }] = await Promise.all([
    supabase
      .from("deals")
      .select("id, client_name, value, status, assigned_sales_id, assigned_dev_id, site_url, created_at, updated_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("id, full_name, role:roles(name)")
      .eq("is_active", true),
  ]);

  const staffMap = new Map(
    (staff ?? [])
      .map((s: StaffRow) => ({
        id: s.id,
        name: s.full_name,
        role: (Array.isArray(s.role) ? s.role[0]?.name : s.role?.name) as UserRole,
      }))
      .filter((s) => s.role === "sales")
      .map((s) => [s.id, s.name]),
  );

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Analitiche</h1>
      <AnaliticheTab deals={deals ?? []} salesNames={staffMap} />
    </div>
  );
}
