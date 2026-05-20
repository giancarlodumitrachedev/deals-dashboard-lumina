import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth";

export async function POST(_: Request, ctx: { params: { id: string } }) {
  const session = await requireSession();
  if (!session.can("mark_paid")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const supabase = createSupabaseServerClient();
  const { data, error: getErr } = await supabase
    .from("commissions")
    .select("status")
    .eq("id", ctx.params.id)
    .single();
  if (getErr || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const next = data.status === "paid" ? "pending" : "paid";
  const { error } = await supabase
    .from("commissions")
    .update({ status: next, paid_at: next === "paid" ? new Date().toISOString() : null })
    .eq("id", ctx.params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ status: next });
}
