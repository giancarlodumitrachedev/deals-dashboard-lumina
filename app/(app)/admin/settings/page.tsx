import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DEFAULT_WHATSAPP_TEMPLATE } from "@/lib/settings";
import { SettingsAdmin } from "./SettingsAdmin";
import type { UserRole } from "@/lib/types/domain";

export const dynamic = "force-dynamic";

interface PermRow {
  action: string;
  role: { name: UserRole } | { name: UserRole }[] | null;
}

export default async function SettingsPage() {
  const session = await requireSession();
  if (session.role !== "admin") redirect("/");

  const supabase = createSupabaseServerClient();
  const [{ data: tpl }, { data: perms }] = await Promise.all([
    supabase.from("app_settings").select("value").eq("key", "whatsapp_template").maybeSingle(),
    supabase.from("permissions").select("action, role:roles(name)"),
  ]);

  // Build current matrix: role -> Set(actions)
  const matrix: Record<string, string[]> = { manager: [], developer: [], sales: [], admin: [] };
  for (const p of (perms ?? []) as PermRow[]) {
    const roleName = (Array.isArray(p.role) ? p.role[0]?.name : p.role?.name) as UserRole | undefined;
    if (roleName) (matrix[roleName] ??= []).push(p.action);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Impostazioni generali</h1>
      <SettingsAdmin
        whatsappTemplate={(tpl?.value as string) ?? DEFAULT_WHATSAPP_TEMPLATE}
        matrix={matrix}
      />
    </div>
  );
}
