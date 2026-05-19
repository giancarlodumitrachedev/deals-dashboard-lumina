import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth";
import { DevQueue } from "./DevQueue";

export const dynamic = "force-dynamic";

export default async function DeveloperPage() {
  const session = await requireSession();
  const supabase = createSupabaseServerClient();

  const { data: deals } = await supabase
    .from("deals")
    .select("id, client_name, status, site_url, created_at")
    .eq("assigned_dev_id", session.userId)
    .eq("status", "in_development")
    .order("created_at", { ascending: true });

  return <DevQueue deals={deals ?? []} />;
}
