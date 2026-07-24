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
    const stats: DashboardStats = {
      totalListings: listings.length,
      pending: listings.filter((l) => l.status === 'pending').length,
      active: listings.filter((l) => l.status === 'active').length,
      rejected: listings.filter((l) => l.status === 'rejected').length,
      byCategory,
      byStatus,
    };
    return HttpResponse.json(stats);
  }),
];
