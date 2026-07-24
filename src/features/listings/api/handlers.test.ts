import { beforeEach, describe, expect, it } from 'vitest';

import { api } from '@/lib/api/client';
import type { Paginated } from '@/lib/api/types';
import { getAuditFor } from '@/lib/audit';
import { resetListingsDb } from './handlers';
import type { Listing } from '../schemas/listing';

beforeEach(() => resetListingsDb());

describe('listings handlers', () => {
  it('returns the paginated envelope and filters by status', async () => {
    const res = await api.list<Listing>('listings', {
      page: 1,
      pageSize: 10,
      filters: { status: 'pending' },
    });
    expect(res.total).toBeGreaterThan(0);
    expect(res.items.every((l) => l.status === 'pending')).toBe(true);
    expect(res.items.length).toBeLessThanOrEqual(10);
  });

  it('returns a single listing by id', async () => {
    const listing = await api.get<Listing>('/listings/L-1000');
    expect(listing.id).toBe('L-1000');
  });

  it('moderation (OK) publishes the listing and writes an audit entry', async () => {
    const before = await api.get<Listing>('/listings/L-1001');
    const after = await api.post<Listing>('/listings/L-1001/moderate', {
      decision: 'ok',
    });
    expect(after.status).toBe('active');
    const audit = getAuditFor('listing:L-1001');
    expect(audit).toHaveLength(1);
    expect(audit[0]?.action).toBe('listing.approve');
    expect(before.id).toBe('L-1001');
  });

  it('records an ai:* actor when the AI copilot approves (guardrail attribution)', async () => {
    const after = await api.post<Listing>('/listings/L-1003/moderate', {
      decision: 'ok',
      actor: 'ai:moderation-copilot',
    });
    expect(after.status).toBe('active');
    const audit = getAuditFor('listing:L-1003');
    expect(audit[0]?.action).toBe('listing.approve');
    expect(audit[0]?.actor).toBe('ai:moderation-copilot');
  });

  it('moderation (NOK) rejects and records the reason', async () => {
    const after = await api.post<Listing>('/listings/L-1002/moderate', {
      decision: 'nok',
      reason: 'Eksik belge',
    });
    expect(after.status).toBe('rejected');
    const audit = getAuditFor('listing:L-1002');
    expect(audit[0]?.action).toBe('listing.reject');
  });

  it('creates a listing in pending status', async () => {
    const created = await api.post<Listing>('/listings', {
      title: 'Test ilan',
      category: 'konut',
      price: 1_000_000,
    });
    expect(created.status).toBe('pending');
    const res = await api.get<Paginated<Listing>>('/listings', new URLSearchParams({ q: 'Test ilan' }));
    expect(res.items.some((l) => l.title === 'Test ilan')).toBe(true);
  });
});
