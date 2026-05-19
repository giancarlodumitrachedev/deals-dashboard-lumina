import type { UserRole } from "@/lib/types/domain";

export const PERMISSIONS = {
  view_all_deals: ["admin", "manager"] as UserRole[],
  create_lead: ["admin", "manager"] as UserRole[],
  assign_deals: ["admin", "manager"] as UserRole[],
  update_deal_status: ["admin", "sales"] as UserRole[],
  upload_site: ["admin", "developer"] as UserRole[],
  mark_paid: ["admin"] as UserRole[],
  manage_users: ["admin"] as UserRole[],
  view_analytics: ["admin"] as UserRole[],
};

export function can(role: UserRole, action: keyof typeof PERMISSIONS): boolean {
  return PERMISSIONS[action].includes(role);
}
