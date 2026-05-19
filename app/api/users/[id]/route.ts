import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { updateUserSchema } from "@/lib/validators";

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const session = await requireSession();
  if (session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dati non validi" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const update: Record<string, unknown> = {};
  if (parsed.data.full_name !== undefined) update.full_name = parsed.data.full_name;
  if (parsed.data.is_active !== undefined) update.is_active = parsed.data.is_active;
  if (parsed.data.role !== undefined) {
    const { data: r } = await supabase
      .from("roles")
      .select("id")
      .eq("name", parsed.data.role)
      .single();
    if (!r) return NextResponse.json({ error: "Ruolo non valido" }, { status: 400 });
    update.role_id = r.id;
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nessun campo da aggiornare" }, { status: 400 });
  }

  const { error } = await supabase.from("profiles").update(update).eq("id", ctx.params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, ctx: { params: { id: string } }) {
  const session = await requireSession();
  if (session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (ctx.params.id === session.userId) {
    return NextResponse.json({ error: "Non puoi eliminare te stesso" }, { status: 400 });
  }
  let admin;
  try {
    admin = createSupabaseAdminClient();
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
  // Deleting the auth user cascades to public.profiles (FK on delete cascade).
  const { error } = await admin.auth.admin.deleteUser(ctx.params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
