import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { api, encodeListQuery } from '@/lib/api/client';
import type { Paginated } from '@/lib/api/types';
import type { TableQuery } from '@/components/data-table/types';
import type { Province } from '../schemas/location';

export const provinceKeys = {
  all: ['provinces'] as const,
  list: (query: TableQuery) => ['provinces', 'list', query] as const,
  detail: (id: string) => ['provinces', 'detail', id] as const,
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

/** Server-driven provinces list (paginated envelope). */
export function useProvinces(query: TableQuery) {
  return useQuery({
    queryKey: provinceKeys.list(query),
    queryFn: () => api.get<Paginated<Province>>('/provinces', toParams(query)),
    placeholderData: keepPreviousData,
  });
}

/** Single province detail (with its districts + neighborhoods). */
export function useProvince(id: string | undefined) {
  return useQuery({
    queryKey: provinceKeys.detail(id ?? ''),
    queryFn: () => api.get<Province>(`/provinces/${id}`),
    enabled: Boolean(id),
  });
}
