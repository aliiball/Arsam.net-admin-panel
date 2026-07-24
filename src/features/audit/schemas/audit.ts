import { z } from 'zod';

// Re-export the canonical audit entry type from the write-side library so this
// read-only module mirrors it instead of duplicating a competing definition.
export type { AuditEntry } from '@/lib/audit';

/**
 * Zod mirror of `lib/audit`'s `AuditEntry`, used to validate the paginated
 * `GET /audit` envelope. `before`/`after` are opaque snapshots (unknown).
 */
export const auditEntrySchema = z.object({
  id: z.string(),
  actor: z.string(),
  action: z.string(),
  resource: z.string(),
  before: z.unknown().optional(),
  after: z.unknown().optional(),
  ts: z.string(),
});

export const auditPageSchema = z.object({
  items: z.array(auditEntrySchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export type AuditPage = z.infer<typeof auditPageSchema>;
