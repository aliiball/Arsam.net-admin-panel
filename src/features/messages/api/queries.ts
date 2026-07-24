import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { api, encodeListQuery } from '@/lib/api/client';
import type { Paginated } from '@/lib/api/types';
import type { TableQuery } from '@/components/data-table/types';
import type { Report } from '../schemas/report';

export const reportKeys = {
  all: ['reports'] as const,
  list: (query: TableQuery) => ['reports', 'list', query] as const,
  detail: (id: string) => ['reports', 'detail', id] as const,
};

function toParams(query: TableQuery): URLSearchParams {
  const params = encodeListQuery({
    page: query.page,
    pageSize: query.pageSize,
    sort: query.sort,
    filters: query.filters,
  });
  if (query.q) params.set('q', query.q);
  return params;
}

/** Server-driven complaint queue (paginated envelope). */
export function useReports(query: TableQuery) {
  return useQuery({
    queryKey: reportKeys.list(query),
    queryFn: () => api.get<Paginated<Report>>('/reports', toParams(query)),
    placeholderData: keepPreviousData,
  });
}

/** Single complaint detail (+ quoted subject content). */
export function useReport(id: string | undefined) {
  return useQuery({
    queryKey: reportKeys.detail(id ?? ''),
    queryFn: () => api.get<Report>(`/reports/${id}`),
    enabled: Boolean(id),
  });
}
