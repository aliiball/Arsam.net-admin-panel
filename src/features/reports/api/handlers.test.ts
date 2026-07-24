import { describe, expect, it } from 'vitest';

import { api } from '@/lib/api/client';
import type { Listing } from '@/features/listings/schemas/listing';
import type { Payment } from '@/features/promotions/schemas/promotion';
import type { Report } from '@/features/messages/schemas/report';
import { computeOverview, netRevenue, resolveWindow } from '../lib/overview';
import { reportsOverviewSchema, type ReportsOverview } from '../schemas/reports';

function listing(partial: Partial<Listing> & Pick<Listing, 'id' | 'status' | 'category' | 'createdAt'>): Listing {
  return {
    title: partial.id,
    description: '',
    price: 0,
    il: '34',
    ilce: 'kadikoy',
    mahalle: 'Moda',
    attributes: {},
    agentName: 'Ofis',
    aiSuggestion: 'ok',
    aiReasons: [],
    ...partial,
  } as Listing;
}

function payment(partial: Partial<Payment> & Pick<Payment, 'id' | 'amount' | 'status' | 'createdAt'>): Payment {
  return {
    invoiceNo: partial.id,
    userId: 'U-1',
    userName: 'Kullanıcı',
    packageId: 'PK-1',
    packageName: 'Paket',
    method: 'card',
    lineItems: [],
    ...partial,
  } as Payment;
}

function report(partial: Partial<Report> & Pick<Report, 'id' | 'status' | 'createdAt'>): Report {
  return {
    subjectType: 'listing',
    subjectId: 'L-1',
    subjectLabel: 'Konu',
    reasonCategory: 'spam',
    description: '',
    priority: 'normal',
    reporterName: 'Şikayetçi',
    ...partial,
  } as Report;
}

const INPUT = {
  listings: [
    listing({ id: 'L-1', status: 'active', category: 'konut', createdAt: '2026-07-01T09:00:00.000Z' }),
    listing({ id: 'L-2', status: 'pending', category: 'konut', createdAt: '2026-07-01T12:00:00.000Z' }),
    listing({ id: 'L-3', status: 'rejected', category: 'arsa', createdAt: '2026-07-03T09:00:00.000Z' }),
    listing({ id: 'L-4', status: 'active', category: 'isyeri', createdAt: '2026-05-01T09:00:00.000Z' }), // outside 7d/30d windows near 07-03
  ],
  payments: [
    payment({ id: 'P-1', amount: 1000, status: 'paid', createdAt: '2026-07-01T09:00:00.000Z' }),
    payment({ id: 'P-2', amount: 500, status: 'partially-refunded', refundedAmount: 200, createdAt: '2026-07-03T09:00:00.000Z' }),
    payment({ id: 'P-3', amount: 300, status: 'failed', createdAt: '2026-07-03T10:00:00.000Z' }), // excluded from gross/revenue
  ],
  reports: [
    report({ id: 'R-1', status: 'open', createdAt: '2026-07-02T09:00:00.000Z' }),
    report({ id: 'R-2', status: 'resolved', createdAt: '2026-07-02T10:00:00.000Z' }),
  ],
};

describe('computeOverview (pure)', () => {
  it('resolves the window to the latest data day and back n-1 days', () => {
    // 30d window: latest day is 2026-07-03, start = 2026-06-04.
    expect(resolveWindow(INPUT, '30d')).toEqual({ from: '2026-06-04', to: '2026-07-03' });
    // all: clamps to the earliest data day.
    expect(resolveWindow(INPUT, 'all')).toEqual({ from: '2026-05-01', to: '2026-07-03' });
  });

  it('computes revenue as gross paid minus refunds (failed excluded)', () => {
    const o = computeOverview(INPUT, '30d');
    // gross = 1000 + 500 = 1500 (P-3 failed excluded); refunds = 200; revenue = 1300.
    expect(o.kpis.totalRevenue).toBe(1300);
    expect(o.kpis.refundRate).toBeCloseTo(200 / 1500, 6);
  });

  it('netRevenue subtracts refunds and zeroes failed payments', () => {
    expect(netRevenue({ amount: 500, refundedAmount: 200, status: 'partially-refunded' })).toBe(300);
    expect(netRevenue({ amount: 300, status: 'failed' })).toBe(0);
    expect(netRevenue({ amount: 1000, status: 'paid' })).toBe(1000);
  });

  it('scopes KPIs + funnel to the window (excludes the May listing in 30d)', () => {
    const o = computeOverview(INPUT, '30d');
    expect(o.kpis.totalListings).toBe(3); // L-1..L-3, not L-4 (May)
    expect(o.kpis.activeListings).toBe(1);
    expect(o.kpis.pendingModeration).toBe(1);
    expect(o.kpis.openReports).toBe(1);
    const funnel = Object.fromEntries(o.moderationFunnel.map((s) => [s.stage, s.value]));
    expect(funnel).toMatchObject({ submitted: 3, pending: 1, active: 1, rejected: 1 });
  });

  it('all-range includes the May listing', () => {
    const o = computeOverview(INPUT, 'all');
    expect(o.kpis.totalListings).toBe(4);
    expect(o.kpis.activeListings).toBe(2);
  });

  it('builds gap-free daily trends and is schema-valid + deterministic', () => {
    const a = computeOverview(INPUT, '30d');
    const b = computeOverview(INPUT, '30d');
    expect(a).toEqual(b);
    expect(() => reportsOverviewSchema.parse(a)).not.toThrow();
    // 2026-06-04 → 2026-07-03 inclusive = 30 buckets.
    expect(a.listingsTrend).toHaveLength(30);
    const jul1 = a.listingsTrend.find((p) => p.date === '2026-07-01');
    expect(jul1?.value).toBe(2);
    const jul3Rev = a.revenueTrend.find((p) => p.date === '2026-07-03');
    expect(jul3Rev?.value).toBe(300); // 500 − 200 refund
  });
});

describe('reports overview handler (MSW)', () => {
  it('returns a schema-valid overview envelope', async () => {
    const res = await api.get<ReportsOverview>('/reports/overview', new URLSearchParams({ range: '30d' }));
    expect(() => reportsOverviewSchema.parse(res)).not.toThrow();
    expect(res.range).toBe('30d');
    expect(res.kpis.totalRevenue).toBeGreaterThanOrEqual(0);
    expect(res.byCategory.length).toBeGreaterThan(0);
    expect(res.moderationFunnel.some((s) => s.stage === 'submitted')).toBe(true);
  });

  it('falls back to 30d for an invalid range', async () => {
    const res = await api.get<ReportsOverview>('/reports/overview', new URLSearchParams({ range: 'bogus' }));
    expect(res.range).toBe('30d');
  });

  it('honors the range param', async () => {
    const res = await api.get<ReportsOverview>('/reports/overview', new URLSearchParams({ range: '7d' }));
    expect(res.range).toBe('7d');
    expect(res.listingsTrend).toHaveLength(7);
  });
});
