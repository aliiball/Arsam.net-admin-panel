import { beforeEach, describe, expect, it } from 'vitest';

import { api } from '@/lib/api/client';
import type { Paginated } from '@/lib/api/types';
import { getAuditFor } from '@/lib/audit';
import { resetUsersDb } from './handlers';
import { computeTrustScore, type User } from '../schemas/user';

beforeEach(() => resetUsersDb());

describe('computeTrustScore', () => {
  it('returns 0 for banned users regardless of verification', () => {
    const score = computeTrustScore({
      status: 'banned',
      verification: { identity: 'verified', office: 'verified', phone: 'verified' },
      listingsCount: 20,
    });
    expect(score).toBe(0);
  });

  it('rewards fully verified active accounts and clamps to 100', () => {
    const score = computeTrustScore({
      status: 'active',
      verification: { identity: 'verified', office: 'verified', phone: 'verified' },
      listingsCount: 20,
    });
    expect(score).toBe(100);
  });

  it('caps suspended accounts at a low ceiling', () => {
    const score = computeTrustScore({
      status: 'suspended',
      verification: { identity: 'verified', office: 'verified', phone: 'verified' },
      listingsCount: 20,
    });
    expect(score).toBeLessThanOrEqual(35);
  });

  it('scores an unverified fresh account below a verified one', () => {
    const low = computeTrustScore({
      status: 'active',
      verification: { identity: 'none', office: 'none', phone: 'none' },
      listingsCount: 0,
    });
    const high = computeTrustScore({
      status: 'active',
      verification: { identity: 'verified', office: 'none', phone: 'verified' },
      listingsCount: 5,
    });
    expect(low).toBeLessThan(high);
  });
});

describe('users handlers', () => {
  it('returns the paginated envelope and filters by status', async () => {
    const res = await api.list<User>('users', {
      page: 1,
      pageSize: 10,
      filters: { status: 'banned' },
    });
    expect(res.total).toBeGreaterThan(0);
    expect(res.items.every((u) => u.status === 'banned')).toBe(true);
    expect(res.items.length).toBeLessThanOrEqual(10);
  });

  it('filters by trust score range', async () => {
    const res = await api.list<User>('users', {
      page: 1,
      pageSize: 50,
      filters: { trustMin: '70' },
    });
    expect(res.items.every((u) => u.trustScore >= 70)).toBe(true);
  });

  it('returns a single user by id', async () => {
    const user = await api.get<User>('/users/U-2000');
    expect(user.id).toBe('U-2000');
  });

  it('verify sets identity verified and writes an audit entry', async () => {
    const after = await api.post<User>('/users/U-2001/action', { action: 'verify' });
    expect(after.verification.identity).toBe('verified');
    const audit = getAuditFor('user:U-2001');
    expect(audit[0]?.action).toBe('user.verify');
  });

  it('ban suspends the account, records the reason, and drops trust to 0', async () => {
    const after = await api.post<User>('/users/U-2002/action', {
      action: 'ban',
      reason: 'Sahte ilan yayınladı',
    });
    expect(after.status).toBe('banned');
    expect(after.trustScore).toBe(0);
    const audit = getAuditFor('user:U-2002');
    expect(audit[0]?.action).toBe('user.ban');
  });

  it('unban reactivates a banned account', async () => {
    await api.post<User>('/users/U-2003/action', { action: 'ban', reason: 'test' });
    const after = await api.post<User>('/users/U-2003/action', { action: 'unban' });
    expect(after.status).toBe('active');
    const res = await api.get<Paginated<User>>('/users', new URLSearchParams({ status: 'active', pageSize: '50' }));
    expect(res.items.some((u) => u.id === 'U-2003')).toBe(true);
  });
});
