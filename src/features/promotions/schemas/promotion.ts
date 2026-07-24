import { z } from 'zod';

import { PACKAGE_KINDS, PACKAGE_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES } from '../data/promotions';

// Re-export the shared ordering helpers (single origin, no duplication).
export { sortByOrder, nextOrder } from '@/lib/order';

/**
 * A doping (promotion) package a seller can buy to surface a listing.
 * Source of truth for the type. Money is stored as a whole-number amount.
 */
export const dopingPackageSchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: z.enum(PACKAGE_KINDS),
  durationDays: z.number().int().positive(),
  price: z.number().nonnegative(),
  status: z.enum(PACKAGE_STATUSES),
  order: z.number().int().nonnegative(),
});
export type DopingPackage = z.infer<typeof dopingPackageSchema>;

/** One billed line on an invoice. `quantity * unitPrice` = line total. */
export const paymentLineItemSchema = z.object({
  label: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
});
export type PaymentLineItem = z.infer<typeof paymentLineItemSchema>;

/**
 * A payment/invoice for a doping package. `refundedAmount` is the cumulative
 * amount refunded so far (undefined = none). Remaining = amount − refundedAmount.
 */
export const paymentSchema = z.object({
  id: z.string(),
  invoiceNo: z.string(),
  userId: z.string(),
  userName: z.string(),
  packageId: z.string(),
  packageName: z.string(),
  amount: z.number().nonnegative(),
  method: z.enum(PAYMENT_METHODS),
  status: z.enum(PAYMENT_STATUSES),
  createdAt: z.string(),
  lineItems: z.array(paymentLineItemSchema),
  refundedAmount: z.number().nonnegative().optional(),
});
export type Payment = z.infer<typeof paymentSchema>;

/**
 * Server-side refund input. Reason is required (guardrail) and the amount must
 * be positive; the ≤ remaining check lives in the handler (needs runtime state)
 * and returns 422 when exceeded.
 */
export const refundActionSchema = z
  .object({
    amount: z.number().positive('İade tutarı 0’dan büyük olmalı'),
    reason: z.string().optional(),
  })
  .refine((v) => (v.reason?.trim().length ?? 0) > 0, {
    message: 'İade için gerekçe zorunludur.',
    path: ['reason'],
  });
export type RefundActionInput = z.infer<typeof refundActionSchema>;

// ---------------------------------------------------------------------------
// Form schemas (numeric fields kept as strings; parsed at the submit boundary
// to avoid the zod-coerce transform-generics clash — see Task 003/005).
// ---------------------------------------------------------------------------

const numericString = (msg: string) => z.string().regex(/^\d+$/, msg);

/** Create/edit a package. Price + duration are numeric-strings. */
export const packageFormSchema = z.object({
  name: z.string().trim().min(3, 'En az 3 karakter'),
  kind: z.enum(PACKAGE_KINDS),
  durationDays: numericString('Gün sayısı girin (sadece rakam)').refine(
    (s) => Number(s) > 0,
    'Süre 0’dan büyük olmalı',
  ),
  price: numericString('Fiyat girin (sadece rakam)'),
  status: z.enum(PACKAGE_STATUSES),
});
export type PackageFormValues = z.infer<typeof packageFormSchema>;

/** Convert validated package-form values into the API payload (numbers parsed). */
export function packageFormToPayload(values: PackageFormValues) {
  return {
    name: values.name.trim(),
    kind: values.kind,
    durationDays: Number(values.durationDays),
    price: Number(values.price),
    status: values.status,
  };
}

/**
 * Refund dialog form. `full` toggles a full-remaining refund; when off the user
 * enters a partial amount. The amount (numeric-string) must be > 0 and ≤ the
 * remaining balance; reason ≥ 5 chars. `remaining` parameterizes the ceiling.
 */
export function makeRefundFormSchema(remaining: number) {
  return z.object({
    full: z.boolean(),
    amount: numericString('Tutar girin (sadece rakam)')
      .refine((s) => Number(s) > 0, 'Tutar 0’dan büyük olmalı')
      .refine((s) => Number(s) <= remaining, `İade tutarı kalan tutarı (${remaining}) aşamaz`),
    reason: z.string().trim().min(5, 'En az 5 karakter gerekçe girin'),
  });
}
export type RefundFormValues = { full: boolean; amount: string; reason: string };

// ---------------------------------------------------------------------------
// Pure money helpers (UI-independent, unit-tested).
// ---------------------------------------------------------------------------

/** Remaining refundable balance on a payment (never negative). */
export function remainingAmount(payment: Pick<Payment, 'amount' | 'refundedAmount'>): number {
  return Math.max(0, payment.amount - (payment.refundedAmount ?? 0));
}

/**
 * Compute the payment status + cumulative refundedAmount after refunding
 * `amount`. Full-remaining → 'refunded', otherwise 'partially-refunded'.
 * Assumes `amount` was already validated (0 < amount ≤ remaining).
 */
export function refundOutcome(
  payment: Pick<Payment, 'amount' | 'refundedAmount'>,
  amount: number,
): { status: PaymentStatusLike; refundedAmount: number } {
  const refundedAmount = (payment.refundedAmount ?? 0) + amount;
  const status: PaymentStatusLike = refundedAmount >= payment.amount ? 'refunded' : 'partially-refunded';
  return { status, refundedAmount };
}

type PaymentStatusLike = 'refunded' | 'partially-refunded';

/** Whether a payment can still be (partially) refunded. */
export function isRefundable(payment: Pick<Payment, 'status' | 'amount' | 'refundedAmount'>): boolean {
  return (
    (payment.status === 'paid' || payment.status === 'partially-refunded') && remainingAmount(payment) > 0
  );
}

/** Format a whole-lira amount as tr-TR with the ₺ suffix (display only). */
export function formatTry(amount: number): string {
  return `${amount.toLocaleString('tr-TR')} ₺`;
}
