import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateOwnProfileSchema } from "@/lib/validators";

export async function PATCH(req: Request) {
  const session = await requireSession();
  const parsed = updateOwnProfileSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dati non validi" }, { status: 400 });
  }
  const update: Record<string, unknown> = {};
  if (parsed.data.full_name !== undefined) update.full_name = parsed.data.full_name;
  if (parsed.data.iban !== undefined) update.iban = parsed.data.iban;
  if (parsed.data.payment_method !== undefined) update.payment_method = parsed.data.payment_method;
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nessun campo da aggiornare" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("profiles").update(update).eq("id", session.userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
