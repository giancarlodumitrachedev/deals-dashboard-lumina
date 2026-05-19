import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { assignDealSchema } from "@/lib/validators";

export async function POST(req: Request, ctx: { params: { id: string } }) {
  const session = await requireSession();
  if (!can(session.role, "assign_deals")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const parsed = assignDealSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const supabase = createSupabaseServerClient();
  const update: Record<string, string | null> = {};
  if (parsed.data.assigned_sales_id !== undefined)
    update.assigned_sales_id = parsed.data.assigned_sales_id;
  if (parsed.data.assigned_dev_id !== undefined)
    update.assigned_dev_id = parsed.data.assigned_dev_id;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No assignment provided" }, { status: 400 });
  }

  const { error } = await supabase.from("deals").update(update).eq("id", ctx.params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
