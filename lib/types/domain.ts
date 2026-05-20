export type UserRole = "admin" | "manager" | "developer" | "sales";

export type DealStatus =
  | "new_lead"
  | "in_development"
  | "ready_to_pitch"
  | "decision_pending"
  | "payment_pending"
  | "won"
  | "cancelled";

export type FollowUpStatus = "pending" | "done" | "missed";
export type CommissionStatus = "pending" | "paid";

export const DEAL_STATUSES: DealStatus[] = [
  "new_lead",
  "in_development",
  "ready_to_pitch",
  "decision_pending",
  "payment_pending",
  "won",
  "cancelled",
];

export const SALES_KANBAN_COLUMNS: DealStatus[] = [
  "ready_to_pitch",
  "decision_pending",
  "payment_pending",
  "won",
  "cancelled",
];

// End states: cards here cannot be dragged elsewhere by a sales agent.
export const SALES_TERMINAL_COLUMNS: DealStatus[] = ["won", "cancelled"];

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role_id: number;
  is_active: boolean;
  role?: { name: UserRole } | null;
}

export interface Deal {
  id: string;
  client_name: string;
  phone_number: string | null;
  email: string | null;
  website: string | null;
  job: string | null;
  value: number;
  status: DealStatus;
  assigned_sales_id: string | null;
  assigned_dev_id: string | null;
  site_url: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type ReportType = "bug" | "improvement";
export type ReportSeverity = "low" | "medium" | "high" | "critical";

export interface Report {
  id: string;
  type: ReportType;
  severity: ReportSeverity;
  description: string;
  reporter_id: string | null;
  created_at: string;
}

export interface DealWithRelations extends Deal {
  assigned_sales?: Pick<Profile, "id" | "full_name"> | null;
  assigned_dev?: Pick<Profile, "id" | "full_name"> | null;
  follow_ups?: FollowUp[];
}

export interface FollowUp {
  id: string;
  deal_id: string;
  step_number: 1 | 2 | 3;
  scheduled_date: string;
  status: FollowUpStatus;
  completed_at: string | null;
  created_at: string;
}

export interface DealEvent {
  id: string;
  deal_id: string;
  user_id: string | null;
  action_description: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface Commission {
  id: string;
  deal_id: string;
  user_id: string;
  amount: number;
  status: CommissionStatus;
  paid_at: string | null;
  created_at: string;
}
