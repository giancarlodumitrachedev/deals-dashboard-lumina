import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ReportsAdmin } from "./ReportsAdmin";
import type { ReportType, ReportSeverity } from "@/lib/types/domain";

export const dynamic = "force-dynamic";

interface ReportJoinRow {
  id: string;
  type: ReportType;
  severity: ReportSeverity;
  description: string;
  created_at: string;
  reporter: { full_name: string } | { full_name: string }[] | null;
}

export default async function ReportsPage() {
  const session = await requireSession();
  if (session.role !== "admin") redirect("/");

  const supabase = createSupabaseServerClient();
  const { data: raw } = await supabase
    .from("reports")
    .select("id, type, severity, description, created_at, reporter:profiles(full_name)")
    .order("created_at", { ascending: false });

  const reports = (raw ?? []).map((r: ReportJoinRow) => ({
    id: r.id,
    type: r.type,
    severity: r.severity,
    description: r.description,
    created_at: r.created_at,
    reporter: (Array.isArray(r.reporter) ? r.reporter[0]?.full_name : r.reporter?.full_name) ?? "—",
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Segnalazioni</h1>
      <ReportsAdmin reports={reports} />
    </div>
  );
}
