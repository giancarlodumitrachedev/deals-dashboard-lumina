import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { UsersAdmin } from "./UsersAdmin";
import type { UserRole } from "@/lib/types/domain";

export const dynamic = "force-dynamic";

interface ProfileRow {
  id: string;
  full_name: string;
  email: string;
  is_active: boolean;
  created_at: string;
  role: { name: UserRole } | { name: UserRole }[] | null;
}

export default async function UsersPage() {
  const session = await requireSession();
  if (session.role !== "admin") redirect("/");

  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, is_active, created_at, role:roles(name)")
    .order("created_at", { ascending: false });

  const users = (data ?? []).map((p: ProfileRow) => ({
    id: p.id,
    full_name: p.full_name,
    email: p.email,
    is_active: p.is_active,
    created_at: p.created_at,
    role: (Array.isArray(p.role) ? p.role[0]?.name : p.role?.name) as UserRole,
  }));

  return <UsersAdmin users={users} selfId={session.userId} />;
}
