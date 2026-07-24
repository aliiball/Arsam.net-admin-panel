import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api/client';
import type { ReportsOverview, ReportsRange } from '../schemas/reports';

export const reportsKeys = {
  all: ['reports'] as const,
  overview: (range: ReportsRange) => ['reports', 'overview', range] as const,
};

/** Fetch the analytics overview for a time range (keeps prior data on switch). */
export function useReportsOverview(range: ReportsRange) {
  return useQuery({
    queryKey: reportsKeys.overview(range),
    queryFn: () =>
      api.get<ReportsOverview>('/reports/overview', new URLSearchParams({ range })),
    placeholderData: keepPreviousData,
  });
}
