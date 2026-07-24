import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api/client';
import type { DashboardStats } from './handlers';

export const dashboardKeys = {
  stats: ['dashboard', 'stats'] as const,
};

export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats,
    queryFn: () => api.get<DashboardStats>('/dashboard/stats'),
  });
}

export type { DashboardStats };
