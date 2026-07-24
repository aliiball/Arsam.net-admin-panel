import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { api, encodeListQuery } from '@/lib/api/client';
import type { Paginated } from '@/lib/api/types';
import type { TableQuery } from '@/components/data-table/types';
import type { User } from '../schemas/user';

export const userKeys = {
  all: ['users'] as const,
  list: (query: TableQuery) => ['users', 'list', query] as const,
  detail: (id: string) => ['users', 'detail', id] as const,
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

/** Server-driven users list (paginated envelope). */
export function useUsers(query: TableQuery) {
  return useQuery({
    queryKey: userKeys.list(query),
    queryFn: () => api.get<Paginated<User>>('/users', toParams(query)),
    placeholderData: keepPreviousData,
  });
}

/** Single user/office detail. */
export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: userKeys.detail(id ?? ''),
    queryFn: () => api.get<User>(`/users/${id}`),
    enabled: Boolean(id),
  });
}
