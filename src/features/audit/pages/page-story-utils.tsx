import type { AuditEntry } from '@/lib/audit';

// Reuse the seeded-client + memory-router harness from the listings vertical,
// and the deterministic error-state seeder from the messages vertical.
export { renderPage, makeSeededClient } from '@/features/listings/pages/page-story-utils';
export { seedQueryError } from '@/features/messages/pages/page-story-utils';

/**
 * Deterministic audit fixtures for stories/tests. Mixes human (`user:*`) and
 * automated (`ai:*`) actors across several action families, with before/after
 * diffs and human-entered reasons. NOT seeded into the live `lib/audit` log —
 * this module is read-only.
 */
export const MOCK_AUDIT: AuditEntry[] = [
  {
    id: 'audit-1',
    actor: 'ai:moderator',
    action: 'listing.hold',
    resource: 'listing:L-1000',
    before: { status: 'pending' },
    after: { status: 'pending', reason: 'Fotoğraf sayısı yetersiz, insan onayı bekleniyor.' },
    ts: '2026-07-23T14:20:00.000Z',
  },
  {
    id: 'audit-2',
    actor: 'user:current',
    action: 'listing.approve',
    resource: 'listing:L-1000',
    before: { status: 'pending' },
    after: { status: 'active' },
    ts: '2026-07-23T15:05:00.000Z',
  },
  {
    id: 'audit-3',
    actor: 'user:current',
    action: 'user.suspend',
    resource: 'user:U-2001',
    before: { status: 'active', verification: 'verified' },
    after: { status: 'suspended', verification: 'verified', reason: 'Tekrarlayan spam şikayetleri.' },
    ts: '2026-07-23T16:40:00.000Z',
  },
  {
    id: 'audit-4',
    actor: 'ai:risk-scanner',
    action: 'report.escalate',
    resource: 'report:R-3000',
    before: { status: 'open' },
    after: { status: 'escalated', reason: 'Dolandırıcılık örüntüsü tespit edildi.' },
    ts: '2026-07-24T09:10:00.000Z',
  },
  {
    id: 'audit-5',
    actor: 'user:current',
    action: 'payment.refund',
    resource: 'payment:PAY-5001',
    before: { status: 'paid', refundedAmount: 0 },
    after: { status: 'partially-refunded', refundedAmount: 250, reason: 'Kısmi iade talebi onaylandı.' },
    ts: '2026-07-24T10:30:00.000Z',
  },
  {
    id: 'audit-6',
    actor: 'user:current',
    action: 'category.archive',
    resource: 'category:devremulk',
    before: { status: 'active' },
    after: { status: 'archived' },
    ts: '2026-07-24T11:15:00.000Z',
  },
];
