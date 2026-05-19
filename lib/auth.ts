import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types/domain";

export interface SessionContext {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export async function requireSession(): Promise<SessionContext> {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role:roles(name)")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    // Profile row missing — auth trigger should normally create it.
    redirect("/login");
  }

  // Supabase joins return either an object or an array depending on the relation
  // shape; normalize to a single record.
  const profileRoleField = (profile as unknown as { role: { name: UserRole } | { name: UserRole }[] | null }).role;
  const roleRow = Array.isArray(profileRoleField)
    ? (profileRoleField[0] ?? null)
    : (profileRoleField ?? null);

  if (!roleRow) redirect("/login");

  return {
    userId: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: roleRow.name,
  };
}

export function roleLandingPath(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "manager":
      return "/manager";
    case "developer":
      return "/developer";
    case "sales":
      return "/sales";
  }
}
