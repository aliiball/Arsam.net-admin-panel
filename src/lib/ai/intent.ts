import { z } from 'zod';

/**
 * Structured intents produced by the deterministic command parser.
 * This is a RULE-BASED copilot — there is NO LLM. Every intent is a pure,
 * testable function of the input text + a caller-supplied vocabulary context.
 * AI proposes; a human confirms before anything is written (see `apply-intent`).
 */

/** A single proposed filter chip (key/value + a human label for display). */
export const filterChipSchema = z.object({
  key: z.string(),
  value: z.string(),
  label: z.string(),
});
export type FilterChip = z.infer<typeof filterChipSchema>;

/** Apply a filter set on a list route (confirm-before-apply via the UI). */
export const filterIntentSchema = z.object({
  kind: z.literal('filter'),
  entity: z.string(),
  /** Target list route the filters apply to (e.g. `/listings`). */
  to: z.string(),
  /** Filter params keyed as the table URL-state expects them. */
  filters: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
  chips: z.array(filterChipSchema),
});
export type FilterIntent = z.infer<typeof filterIntentSchema>;

/** Navigate to a module/route. */
export const navigateIntentSchema = z.object({
  kind: z.literal('navigate'),
  to: z.string(),
  label: z.string(),
});
export type NavigateIntent = z.infer<typeof navigateIntentSchema>;

/**
 * A guardrailed bulk action the copilot can PROPOSE. It never runs without an
 * explicit human confirmation (`apply-intent` throws if unconfirmed).
 */
export const bulkActionSchema = z.enum(['approve-ai-ok']);
export type BulkAction = z.infer<typeof bulkActionSchema>;

export const bulkActionIntentSchema = z.object({
  kind: z.literal('bulk-action'),
  action: bulkActionSchema,
  entity: z.string(),
  /** Route whose queue the action operates over. */
  to: z.string(),
  label: z.string(),
});
export type BulkActionIntent = z.infer<typeof bulkActionIntentSchema>;

/** Fallback when nothing matched — the parser NEVER guesses. */
export const unknownIntentSchema = z.object({
  kind: z.literal('unknown'),
  input: z.string(),
});
export type UnknownIntent = z.infer<typeof unknownIntentSchema>;

export const intentSchema = z.discriminatedUnion('kind', [
  filterIntentSchema,
  navigateIntentSchema,
  bulkActionIntentSchema,
  unknownIntentSchema,
]);
export type Intent = z.infer<typeof intentSchema>;
