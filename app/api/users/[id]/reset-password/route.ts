import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const bodySchema = z.object({ password: z.string().min(8).max(72) });

export async function POST(req: Request, ctx: { params: { id: string } }) {
  const session = await requireSession();
  if (session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Password non valida" }, { status: 400 });

  let admin;
  try {
    admin = createSupabaseAdminClient();
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
  const { error } = await admin.auth.admin.updateUserById(ctx.params.id, {
    password: parsed.data.password,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
