import { http, HttpResponse } from 'msw';

import { API_BASE_URL } from '@/lib/api/client';
import { getListingsSnapshot } from '@/features/listings/api/handlers';
import { CATEGORY_LABELS, STATUS_LABELS, type Category, type ListingStatus } from '@/features/listings/data/taxonomy';

export interface DashboardStats {
  totalListings: number;
  pending: number;
  active: number;
  rejected: number;
  byCategory: { category: Category; label: string; count: number }[];
  byStatus: { status: ListingStatus; label: string; count: number }[];
  /** Deterministic 7-point mock trend series (oldest → newest) per KPI, ending at
      the current value. Powers the KpiCard sparklines until FastAPI ships real
      time-series. */
  trends: {
    totalListings: number[];
    pending: number[];
    active: number[];
    rejected: number[];
  };
}

/** Build a deterministic 7-point series ending exactly at `end` (no Date/random). */
function makeTrend(end: number, seed: number): number[] {
  const points = 7;
  const out: number[] = [];
  for (let i = 0; i < points; i++) {
    const base = end * (0.6 + (0.4 * i) / (points - 1));
    const wobble = ((seed * (i + 3)) % 7) - 3; // deterministic -3..3
    out.push(Math.max(0, Math.round(base + wobble)));
  }
  out[points - 1] = end;
  return out;
}

export const dashboardHandlers = [
  http.get(`${API_BASE_URL}/dashboard/stats`, () => {
    const listings = getListingsSnapshot();
    const byCategory = (Object.keys(CATEGORY_LABELS) as Category[]).map((category) => ({
      category,
      label: CATEGORY_LABELS[category],
      count: listings.filter((l) => l.category === category).length,
    }));
    const byStatus = (Object.keys(STATUS_LABELS) as ListingStatus[]).map((status) => ({
      status,
      label: STATUS_LABELS[status],
      count: listings.filter((l) => l.status === status).length,
    }));
    const totalListings = listings.length;
    const pending = listings.filter((l) => l.status === 'pending').length;
    const active = listings.filter((l) => l.status === 'active').length;
    const rejected = listings.filter((l) => l.status === 'rejected').length;
    const stats: DashboardStats = {
      totalListings,
      pending,
      active,
      rejected,
      byCategory,
      byStatus,
      trends: {
        totalListings: makeTrend(totalListings, 1),
        pending: makeTrend(pending, 2),
        active: makeTrend(active, 3),
        rejected: makeTrend(rejected, 4),
      },
    };
    return HttpResponse.json(stats);
  }),
];
