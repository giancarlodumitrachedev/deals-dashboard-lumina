import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth";

export async function POST(_: Request, ctx: { params: { id: string } }) {
  const session = await requireSession();
  if (session.role !== "sales" && session.role !== "admin" && session.role !== "manager") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("follow_ups")
    .update({ status: "done" })
    .eq("id", ctx.params.id)
    .eq("status", "pending");
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
