import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth";
import { createDealsBulkSchema } from "@/lib/validators";

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session.can("create_lead")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const parsed = createDealsBulkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dati non validi", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const supabase = createSupabaseServerClient();
  const rows = parsed.data.map((d) => ({
    client_name: d.client_name,
    phone_number: d.phone_number ?? null,
    email: d.email ?? null,
    website: d.website ?? null,
    job: d.job ?? null,
    value: d.value,
    notes: d.notes ?? null,
  }));

  const { data, error } = await supabase.from("deals").insert(rows).select("id");
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ created: data?.length ?? 0, ids: (data ?? []).map((r) => r.id) });
}
