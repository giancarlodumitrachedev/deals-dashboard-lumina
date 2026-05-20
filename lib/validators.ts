import { z } from "zod";
import { DEAL_STATUSES } from "@/lib/types/domain";

// Phone: optional leading +, then digits only. Allow spaces during typing
// but normalize before validation.
export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/\s+/g, ""))
  .refine((v) => v === "" || /^\+?\d{6,20}$/.test(v), {
    message: "Telefono non valido: solo cifre e '+' iniziale.",
  })
  .transform((v) => (v === "" ? null : v));

export const dealStatusSchema = z.enum(DEAL_STATUSES as [string, ...string[]]);
export const userRoleSchema = z.enum(["admin", "manager", "developer", "sales"]);
export const reportTypeSchema = z.enum(["bug", "improvement"]);
export const reportSeveritySchema = z.enum(["low", "medium", "high", "critical"]);

const optionalEmail = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .nullable()
  .refine((v) => v === null || z.string().email().safeParse(v).success, {
    message: "Email non valida",
  });

const optionalUrl = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .nullable()
  .refine((v) => v === null || z.string().url().safeParse(v).success, {
    message: "URL non valido",
  });

export const createDealSchema = z.object({
  client_name: z.string().trim().min(2).max(200),
  phone_number: phoneSchema.optional().nullable(),
  email: optionalEmail.optional(),
  website: optionalUrl.optional(),
  job: z.string().trim().max(120).optional().nullable().transform((v) => (v ? v : null)),
  value: z.coerce.number().nonnegative().max(10_000_000),
  notes: z.string().trim().max(2000).optional().nullable().transform((v) => (v ? v : null)),
});

// Bulk: array of leads (1..50). Single-create POSTs an array with one element.
export const createDealsBulkSchema = z
  .union([createDealSchema, z.array(createDealSchema).min(1).max(50)])
  .transform((v) => (Array.isArray(v) ? v : [v]));

export const assignDealSchema = z.object({
  assigned_sales_id: z.string().uuid().nullable().optional(),
  assigned_dev_id: z.string().uuid().nullable().optional(),
});

export const updateStatusSchema = z.object({ status: dealStatusSchema });

export const siteUrlSchema = z.object({
  site_url: z.string().trim().url().max(500),
});

export const updateDealSchema = z.object({
  client_name: z.string().trim().min(2).max(200).optional(),
  phone_number: phoneSchema.nullable().optional(),
  email: optionalEmail.optional(),
  website: optionalUrl.optional(),
  job: z.string().trim().max(120).nullable().optional().transform((v) => (v ? v : v === "" ? null : v)),
  value: z.coerce.number().nonnegative().max(10_000_000).optional(),
  notes: z.string().trim().max(2000).nullable().optional().transform((v) => (v ? v : v === "" ? null : v)),
  site_url: z.string().trim().url().max(500).nullable().optional(),
  status: dealStatusSchema.optional(),
  assigned_sales_id: z.string().uuid().nullable().optional(),
  assigned_dev_id: z.string().uuid().nullable().optional(),
});

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

export const createReportSchema = z.object({
  type: reportTypeSchema,
  severity: reportSeveritySchema,
  description: z.string().trim().min(5).max(2000),
});

export const changePasswordSchema = z.object({
  password: z.string().min(8).max(72),
});

export const updateOwnProfileSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
});
