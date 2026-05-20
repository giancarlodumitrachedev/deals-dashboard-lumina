import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "zod";

const bodySchema = z.object({
  role: z.enum(["manager", "developer", "sales"]), // admin is locked (always full)
  action: z.string().trim().min(1).max(60),
  enabled: z.boolean(),
});

export async function POST(req: Request) {
  const session = await requireSession();
  if (session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });

  const supabase = createSupabaseServerClient();
  const { data: role } = await supabase
    .from("roles")
    .select("id")
    .eq("name", parsed.data.role)
    .single();
  if (!role) return NextResponse.json({ error: "Ruolo non valido" }, { status: 400 });

  if (parsed.data.enabled) {
    const { error } = await supabase
      .from("permissions")
      .upsert({ role_id: role.id, action: parsed.data.action }, { onConflict: "role_id,action" });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  } else {
    const { error } = await supabase
      .from("permissions")
      .delete()
      .eq("role_id", role.id)
      .eq("action", parsed.data.action);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
