import { describe, expect, it } from 'vitest';

import { api } from '@/lib/api/client';
import { writeAudit, type AuditEntry } from '@/lib/audit';
import type { Paginated } from '@/lib/api/types';

/**
 * The audit log is global, append-only state that other verticals mutate at
 * runtime. Pure filter/sort logic is covered exhaustively in `audit-utils.test`
 * with fixed input; here we only assert the handler wires the URL params through
 * to that logic — with loose, self-seeded expectations.
 */
async function fetchAudit(params: Record<string, string>): Promise<Paginated<AuditEntry>> {
  return api.get<Paginated<AuditEntry>>('/audit', new URLSearchParams(params));
}

describe('audit handler (MSW, read-only)', () => {
  it('returns the paginated envelope over the live log', async () => {
    writeAudit({ actor: 'user:current', action: 'listing.approve', resource: 'listing:AUD-T1', ts: '2026-07-24T09:00:00.000Z' });
    writeAudit({ actor: 'ai:moderator', action: 'report.escalate', resource: 'report:AUD-T2', ts: '2026-07-24T10:00:00.000Z' });

    const res = await fetchAudit({ page: '1', pageSize: '100' });
    expect(res.page).toBe(1);
    expect(res.pageSize).toBe(100);
    expect(res.total).toBeGreaterThanOrEqual(2);
    expect(res.items.some((e) => e.resource === 'listing:AUD-T1')).toBe(true);
  });

  it('filters by actor kind (ai) via the facet param', async () => {
    writeAudit({ actor: 'ai:risk-scanner', action: 'listing.hold', resource: 'listing:AUD-AI', ts: '2026-07-24T11:00:00.000Z' });
    const res = await fetchAudit({ page: '1', pageSize: '100', actorKind: 'ai' });
    expect(res.items.length).toBeGreaterThan(0);
    expect(res.items.every((e) => e.actor.startsWith('ai:'))).toBe(true);
  });

  it('filters by action family (attribute.* folds into category)', async () => {
    writeAudit({ actor: 'user:current', action: 'attribute.create', resource: 'category:AUD-CAT', ts: '2026-07-24T12:00:00.000Z' });
    const res = await fetchAudit({ page: '1', pageSize: '100', family: 'category' });
    expect(res.items.some((e) => e.resource === 'category:AUD-CAT')).toBe(true);
    expect(res.items.every((e) => e.action.startsWith('category.') || e.action.startsWith('attribute.'))).toBe(true);
  });

  it('honors the free-text q param', async () => {
    writeAudit({ actor: 'user:current', action: 'user.ban', resource: 'user:AUD-NEEDLE', ts: '2026-07-24T13:00:00.000Z' });
    const res = await fetchAudit({ page: '1', pageSize: '100', q: 'AUD-NEEDLE' });
    expect(res.items).toHaveLength(1);
    expect(res.items[0]!.resource).toBe('user:AUD-NEEDLE');
  });
});
