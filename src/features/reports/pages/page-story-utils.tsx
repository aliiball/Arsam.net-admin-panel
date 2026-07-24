import type { MetricPoint, ReportsOverview } from '../schemas/reports';

// Reuse the seeded-client + memory-router harness (+ real-error seeder).
export { renderPage, makeSeededClient } from '@/features/listings/pages/page-story-utils';
export { seedQueryError } from '@/features/messages/pages/page-story-utils';

/** Deterministic daily series (no clock) for stable stories. */
function series(startDay: number, values: number[]): MetricPoint[] {
  return values.map((value, i) => ({
    date: `2026-07-${String(startDay + i).padStart(2, '0')}`,
    value,
  }));
}

export const MOCK_OVERVIEW: ReportsOverview = {
  range: '7d',
  from: '2026-07-18',
  to: '2026-07-24',
  kpis: {
    totalListings: 128,
    activeListings: 74,
    totalRevenue: 184_500,
    refundRate: 0.06,
    pendingModeration: 19,
    openReports: 8,
  },
  listingsTrend: series(18, [12, 18, 9, 22, 15, 27, 25]),
  revenueTrend: series(18, [21_000, 34_500, 12_000, 41_000, 18_500, 32_000, 25_500]),
  moderationFunnel: [
    { stage: 'submitted', label: 'Gönderilen', value: 128 },
    { stage: 'pending', label: 'Bekleyen', value: 19 },
    { stage: 'active', label: 'Onaylanan', value: 74 },
    { stage: 'rejected', label: 'Reddedilen', value: 35 },
  ],
  byCategory: [
    { key: 'konut', label: 'Konut', value: 62 },
    { key: 'isyeri', label: 'İşyeri', value: 21 },
    { key: 'arsa', label: 'Arsa', value: 28 },
    { key: 'devremulk', label: 'Devremülk', value: 9 },
    { key: 'turistik', label: 'Turistik', value: 8 },
  ],
  byStatus: [
    { key: 'active', label: 'Yayında', value: 74 },
    { key: 'pending', label: 'Beklemede', value: 19 },
    { key: 'rejected', label: 'Reddedildi', value: 35 },
  ],
};

/** An all-zero overview for the Empty story. */
export const EMPTY_OVERVIEW: ReportsOverview = {
  range: '7d',
  from: '2026-07-18',
  to: '2026-07-24',
  kpis: {
    totalListings: 0,
    activeListings: 0,
    totalRevenue: 0,
    refundRate: 0,
    pendingModeration: 0,
    openReports: 0,
  },
  listingsTrend: series(18, [0, 0, 0, 0, 0, 0, 0]),
  revenueTrend: series(18, [0, 0, 0, 0, 0, 0, 0]),
  moderationFunnel: [
    { stage: 'submitted', label: 'Gönderilen', value: 0 },
    { stage: 'pending', label: 'Bekleyen', value: 0 },
    { stage: 'active', label: 'Onaylanan', value: 0 },
    { stage: 'rejected', label: 'Reddedilen', value: 0 },
  ],
  byCategory: [],
  byStatus: [],
};
