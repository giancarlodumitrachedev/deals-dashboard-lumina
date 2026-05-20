import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "zod";

const bodySchema = z.object({
  key: z.string().trim().min(1).max(80),
  value: z.union([z.string().max(4000), z.number(), z.boolean()]),
});

export async function PATCH(req: Request) {
  const session = await requireSession();
  if (session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("app_settings")
    .upsert({ key: parsed.data.key, value: parsed.data.value, updated_at: new Date().toISOString() });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
