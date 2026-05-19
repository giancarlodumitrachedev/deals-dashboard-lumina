import { z } from "zod";
import { DEAL_STATUSES } from "@/lib/types/domain";

export const dealStatusSchema = z.enum(DEAL_STATUSES as [string, ...string[]]);

export const userRoleSchema = z.enum(["admin", "manager", "developer", "sales"]);

export const createUserSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(72),
  full_name: z.string().trim().min(2).max(120),
  role: userRoleSchema,
});

export const updateUserSchema = z.object({
  full_name: z.string().trim().min(2).max(120).optional(),
  role: userRoleSchema.optional(),
  is_active: z.boolean().optional(),
});

export const updateDealSchema = z.object({
  client_name: z.string().trim().min(2).max(200).optional(),
  phone_number: z.string().trim().max(40).nullable().optional(),
  value: z.coerce.number().nonnegative().max(10_000_000).optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
  site_url: z.string().trim().url().max(500).nullable().optional(),
  status: dealStatusSchema.optional(),
  assigned_sales_id: z.string().uuid().nullable().optional(),
  assigned_dev_id: z.string().uuid().nullable().optional(),
});

export const createDealSchema = z.object({
  client_name: z.string().trim().min(2).max(200),
  phone_number: z.string().trim().max(40).optional().nullable(),
  value: z.coerce.number().nonnegative().max(10_000_000),
  notes: z.string().trim().max(2000).optional().nullable(),
});

export const assignDealSchema = z.object({
  assigned_sales_id: z.string().uuid().nullable().optional(),
  assigned_dev_id: z.string().uuid().nullable().optional(),
});

export const updateStatusSchema = z.object({
  status: dealStatusSchema,
});

export const siteUrlSchema = z.object({
  site_url: z.string().trim().url().max(500),
});

export const followUpDoneSchema = z.object({
  follow_up_id: z.string().uuid(),
});

export const commissionPaidSchema = z.object({
  commission_id: z.string().uuid(),
});

export type CreateDealInput = z.infer<typeof createDealSchema>;
export type AssignDealInput = z.infer<typeof assignDealSchema>;
