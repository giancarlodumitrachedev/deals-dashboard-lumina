import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createReportSchema } from "@/lib/validators";

// Any authenticated user can file a report.
export async function POST(req: Request) {
  const session = await requireSession();
  const parsed = createReportSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dati non validi" }, { status: 400 });
  }
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("reports").insert({
    type: parsed.data.type,
    severity: parsed.data.severity,
    description: parsed.data.description,
    reporter_id: session.userId,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
