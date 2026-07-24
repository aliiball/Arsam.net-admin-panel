import { z } from 'zod';

import {
  USER_ACTIONS,
  USER_STATUSES,
  USER_TYPES,
  VERIFICATION_LEVELS,
  type UserStatus,
  type VerificationLevel,
} from '../data/users';

/** Verification state across the three channels (identity/office/phone). */
export const verificationSchema = z.object({
  identity: z.enum(VERIFICATION_LEVELS),
  office: z.enum(VERIFICATION_LEVELS),
  phone: z.enum(VERIFICATION_LEVELS),
});
export type VerificationState = z.infer<typeof verificationSchema>;

/** A connected real-estate office (bağlı ofis). */
export const officeSchema = z.object({
  title: z.string(), // unvan
  taxId: z.string(), // vergi no
  il: z.string(),
  ilce: z.string(),
  memberAgents: z.array(z.string()), // linked agent names
});
export type Office = z.infer<typeof officeSchema>;

/** User/office entity as returned by the API. Source of truth for the type. */
export const userSchema = z.object({
  id: z.string(),
  type: z.enum(USER_TYPES),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  status: z.enum(USER_STATUSES),
  /** Derived trust score (0–100); recomputed via computeTrustScore. */
  trustScore: z.number(),
  verification: verificationSchema,
  il: z.string(),
  listingsCount: z.number(),
  joinedAt: z.string(),
  lastActiveAt: z.string(),
  /** Present for type='office'. */
  office: officeSchema.optional(),
  /** For agents: the office they belong to. */
  officeName: z.string().optional(),
});
export type User = z.infer<typeof userSchema>;

/**
 * User lifecycle action. `suspend`/`ban` require a reason (guardrail); the
 * three-tier verify/suspend/ban maps to the moderation pattern (AI proposes,
 * human disposes) and each action is written to the audit log.
 */
export const userActionSchema = z
  .object({
    action: z.enum(USER_ACTIONS),
    reason: z.string().optional(),
  })
  .refine(
    (v) => v.action === 'verify' || v.action === 'unban' || (v.reason?.trim().length ?? 0) > 0,
    { message: 'Askıya alma / yasaklama için gerekçe zorunludur.', path: ['reason'] },
  );
export type UserActionInput = z.infer<typeof userActionSchema>;

/** Reason-form schema for the action dialog (suspend/ban require ≥5 chars). */
export const reasonFormSchema = z.object({
  reason: z.string().trim().min(5, 'En az 5 karakter gerekçe girin'),
});
export type ReasonFormValues = z.infer<typeof reasonFormSchema>;

/**
 * PURE trust-score derivation (0–100). Unit-testable, UI-independent.
 * Weighs verification channels + activity, then clamps by lifecycle status.
 */
export function computeTrustScore(input: {
  status: UserStatus;
  verification: VerificationState;
  listingsCount: number;
}): number {
  if (input.status === 'banned') return 0;

  const channel = (level: VerificationLevel, verified: number, pending: number): number =>
    level === 'verified' ? verified : level === 'pending' ? pending : level === 'rejected' ? -5 : 0;

  let score = 40; // baseline for a registered account
  score += channel(input.verification.identity, 30, 10);
  score += channel(input.verification.office, 15, 5);
  score += channel(input.verification.phone, 15, 5);
  score += Math.min(input.listingsCount, 20) * 0.5; // up to +10 for activity

  if (input.status === 'suspended') score = Math.min(score, 35);
  if (input.status === 'pending') score = Math.min(score, 60);

  return Math.max(0, Math.min(100, Math.round(score)));
}

/** Trust tier for labelling (color is never the sole signal). */
export type TrustTier = 'low' | 'medium' | 'high';
export function trustTier(score: number): TrustTier {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

export const TRUST_TIER_LABELS: Record<TrustTier, string> = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
};
