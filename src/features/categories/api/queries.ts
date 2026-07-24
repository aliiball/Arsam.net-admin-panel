import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { api, encodeListQuery } from '@/lib/api/client';
import type { Paginated } from '@/lib/api/types';
import type { TableQuery } from '@/components/data-table/types';
import type { Category } from '../schemas/category';

export const categoryKeys = {
  all: ['categories'] as const,
  list: (query: TableQuery) => ['categories', 'list', query] as const,
  detail: (id: string) => ['categories', 'detail', id] as const,
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

/** Server-driven categories list (paginated envelope). */
export function useCategories(query: TableQuery) {
  return useQuery({
    queryKey: categoryKeys.list(query),
    queryFn: () => api.get<Paginated<Category>>('/categories', toParams(query)),
    placeholderData: keepPreviousData,
  });
}

/** Single category detail (with its attribute set). */
export function useCategory(id: string | undefined) {
  return useQuery({
    queryKey: categoryKeys.detail(id ?? ''),
    queryFn: () => api.get<Category>(`/categories/${id}`),
    enabled: Boolean(id),
  });
}
