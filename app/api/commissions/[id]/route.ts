import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { updateCommissionSchema } from "@/lib/validators";

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const session = await requireSession();
  if (!can(session.role, "mark_paid")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = updateCommissionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "URL ricevuta non valido" }, { status: 400 });
  }
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("commissions")
    .update({ receipt_url: parsed.data.receipt_url ?? null })
    .eq("id", ctx.params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
