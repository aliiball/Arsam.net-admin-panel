import { z } from 'zod';

import {
  REASON_CATEGORIES,
  REPORT_ACTIONS,
  REPORT_PRIORITIES,
  REPORT_STATUSES,
  REPORT_SUBJECT_TYPES,
} from '../data/reports';

/**
 * A user-filed complaint against a listing, user or message. Source of truth
 * for the type. The quoted content lives in `subjectLabel` + `description`
 * (real relations arrive with the FastAPI backend).
 */
export const reportSchema = z.object({
  id: z.string(),
  subjectType: z.enum(REPORT_SUBJECT_TYPES),
  subjectId: z.string(),
  subjectLabel: z.string(),
  reasonCategory: z.enum(REASON_CATEGORIES),
  description: z.string(),
  status: z.enum(REPORT_STATUSES),
  priority: z.enum(REPORT_PRIORITIES),
  reporterName: z.string(),
  createdAt: z.string(),
});
export type Report = z.infer<typeof reportSchema>;

/**
 * Moderation action. `dismiss`/`escalate` require a reason (guardrail);
 * `resolve` (the OK tier) does not. Each action is written to the audit log.
 */
export const reportActionSchema = z
  .object({
    action: z.enum(REPORT_ACTIONS),
    reason: z.string().optional(),
  })
  .refine((v) => v.action === 'resolve' || (v.reason?.trim().length ?? 0) > 0, {
    message: 'Reddetme / üst mercie taşıma için gerekçe zorunludur.',
    path: ['reason'],
  });
export type ReportActionInput = z.infer<typeof reportActionSchema>;

/** Reason-form schema for the action dialog (dismiss/escalate require ≥5 chars). */
export const reasonFormSchema = z.object({
  reason: z.string().trim().min(5, 'En az 5 karakter gerekçe girin'),
});
export type ReasonFormValues = z.infer<typeof reasonFormSchema>;
