import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth";
import { updateStatusSchema } from "@/lib/validators";
import type { DealStatus, UserRole } from "@/lib/types/domain";

// Allowed status transitions per role. Sales can move pitch -> decision -> payment -> won/cancelled.
// Developer cannot move status (they only set site_url which triggers ready_to_pitch in DB).
const ROLE_TRANSITIONS: Record<UserRole, Partial<Record<DealStatus, DealStatus[]>>> = {
  admin: {
    new_lead: ["in_development", "cancelled"],
    in_development: ["ready_to_pitch", "cancelled"],
    ready_to_pitch: ["decision_pending", "cancelled"],
    decision_pending: ["payment_pending", "cancelled"],
    payment_pending: ["won", "cancelled"],
    won: [],
    cancelled: [],
  },
  manager: {
    new_lead: ["in_development", "cancelled"],
    in_development: ["cancelled"],
  },
  sales: {
    ready_to_pitch: ["decision_pending", "cancelled"],
    decision_pending: ["payment_pending", "cancelled"],
    payment_pending: ["won", "cancelled"],
  },
  developer: {},
};

export async function POST(req: Request, ctx: { params: { id: string } }) {
  const session = await requireSession();
  const body = await req.json().catch(() => null);
  const parsed = updateStatusSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const supabase = createSupabaseServerClient();
  const { data: deal, error: fetchErr } = await supabase
    .from("deals")
    .select("id, status, assigned_sales_id, assigned_dev_id, site_url")
    .eq("id", ctx.params.id)
    .single();
  if (fetchErr || !deal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // RBAC: assignment check
  if (
    session.role === "sales" &&
    deal.assigned_sales_id !== session.userId
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Transition check
  const allowed = ROLE_TRANSITIONS[session.role][deal.status as DealStatus] ?? [];
  const target = parsed.data.status as DealStatus;
  if (!allowed.includes(target)) {
    return NextResponse.json({ error: "Transizione non consentita" }, { status: 403 });
  }

  const { error: updErr } = await supabase
    .from("deals")
    .update({ status: target })
    .eq("id", deal.id);
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
