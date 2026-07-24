import { beforeEach, describe, expect, it } from 'vitest';

import { api, ApiError } from '@/lib/api/client';
import type { Paginated } from '@/lib/api/types';
import { getAuditFor } from '@/lib/audit';
import { getReportsSnapshot, resetReportsDb } from './handlers';
import type { Report } from '../schemas/report';

beforeEach(() => resetReportsDb());

describe('reports handlers', () => {
  it('returns the paginated envelope and filters by status', async () => {
    const res = await api.list<Report>('reports', {
      page: 1,
      pageSize: 10,
      filters: { status: 'open' },
    });
    expect(res.total).toBeGreaterThan(0);
    expect(res.items.every((r) => r.status === 'open')).toBe(true);
    expect(res.items.length).toBeLessThanOrEqual(10);
  });

  it('filters by subjectType and reasonCategory', async () => {
    const res = await api.list<Report>('reports', {
      page: 1,
      pageSize: 50,
      filters: { subjectType: 'listing', reasonCategory: 'fraud' },
    });
    expect(res.items.every((r) => r.subjectType === 'listing' && r.reasonCategory === 'fraud')).toBe(true);
  });

  it('sorts by createdAt descending', async () => {
    const res = await api.get<Paginated<Report>>(
      '/reports',
      new URLSearchParams({ sort: 'createdAt:desc', pageSize: '50' }),
    );
    const dates = res.items.map((r) => r.createdAt);
    expect([...dates].sort((a, b) => (a < b ? 1 : -1))).toEqual(dates);
  });

  it('returns a single report by id', async () => {
    const first = getReportsSnapshot()[0]!;
    const report = await api.get<Report>(`/reports/${first.id}`);
    expect(report.id).toBe(first.id);
  });

  it('resolve closes the complaint and writes an audit entry', async () => {
    const open = getReportsSnapshot().find((r) => r.status === 'open')!;
    const after = await api.post<Report>(`/reports/${open.id}/action`, { action: 'resolve' });
    expect(after.status).toBe('resolved');
    const audit = getAuditFor(`report:${open.id}`);
    expect(audit[0]?.action).toBe('report.resolve');
  });

  it('dismiss records the reason and escalate moves it up', async () => {
    const rows = getReportsSnapshot().filter((r) => r.status === 'open');
    const dismissed = await api.post<Report>(`/reports/${rows[0]!.id}/action`, {
      action: 'dismiss',
      reason: 'Şikayet asılsız bulundu',
    });
    expect(dismissed.status).toBe('dismissed');
    expect(getAuditFor(`report:${rows[0]!.id}`)[0]?.after).toMatchObject({ reason: 'Şikayet asılsız bulundu' });

    const escalated = await api.post<Report>(`/reports/${rows[1]!.id}/action`, {
      action: 'escalate',
      reason: 'Hukuki değerlendirme gerekiyor',
    });
    expect(escalated.status).toBe('escalated');
  });

  it('rejects dismiss without a reason (guardrail → 422)', async () => {
    const open = getReportsSnapshot().find((r) => r.status === 'open')!;
    await expect(api.post<Report>(`/reports/${open.id}/action`, { action: 'dismiss' })).rejects.toMatchObject({
      status: 422,
    });
    // The report must be untouched after the rejected write.
    const still = await api.get<Report>(`/reports/${open.id}`);
    expect(still.status).toBe('open');
  });

  it('rejects escalate without a reason (guardrail → 422)', async () => {
    const open = getReportsSnapshot().find((r) => r.status === 'open')!;
    const err = await api.post<Report>(`/reports/${open.id}/action`, { action: 'escalate' }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(422);
  });
});
