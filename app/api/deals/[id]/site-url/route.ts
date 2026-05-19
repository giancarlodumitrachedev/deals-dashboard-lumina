import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { siteUrlSchema } from "@/lib/validators";

// Developer (or admin) submits the site URL.
// The DB trigger auto-promotes status in_development -> ready_to_pitch.
export async function POST(req: Request, ctx: { params: { id: string } }) {
  const session = await requireSession();
  if (!can(session.role, "upload_site")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const parsed = siteUrlSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "URL non valido" }, { status: 400 });

  const supabase = createSupabaseServerClient();
  const { data: deal, error: fetchErr } = await supabase
    .from("deals")
    .select("id, assigned_dev_id, status")
    .eq("id", ctx.params.id)
    .single();
  if (fetchErr || !deal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (session.role === "developer" && deal.assigned_dev_id !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase
    .from("deals")
    .update({ site_url: parsed.data.site_url })
    .eq("id", deal.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
