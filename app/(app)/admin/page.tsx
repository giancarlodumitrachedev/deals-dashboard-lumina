import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { OperativitaTab } from "./OperativitaTab";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const session = await requireSession();
  if (session.role !== "admin") redirect("/");

  const supabase = createSupabaseServerClient();
  const { data: deals } = await supabase
    .from("deals")
    .select("id, client_name, value, status, assigned_sales_id, assigned_dev_id, site_url, created_at, updated_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Operatività</h1>
      <OperativitaTab deals={deals ?? []} />
    </div>
  );
}
