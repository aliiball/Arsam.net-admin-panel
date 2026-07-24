import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { api, encodeListQuery } from '@/lib/api/client';
import type { Paginated } from '@/lib/api/types';
import type { TableQuery } from '@/components/data-table/types';
import type { DopingPackage, Payment } from '../schemas/promotion';

export const packageKeys = {
  all: ['packages'] as const,
  list: (query: TableQuery) => ['packages', 'list', query] as const,
  detail: (id: string) => ['packages', 'detail', id] as const,
};

export const paymentKeys = {
  all: ['payments'] as const,
  list: (query: TableQuery) => ['payments', 'list', query] as const,
  detail: (id: string) => ['payments', 'detail', id] as const,
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

/** Server-driven doping-package list (paginated envelope). */
export function usePackages(query: TableQuery) {
  return useQuery({
    queryKey: packageKeys.list(query),
    queryFn: () => api.get<Paginated<DopingPackage>>('/packages', toParams(query)),
    placeholderData: keepPreviousData,
  });
}

/** Single package detail. */
export function usePackage(id: string | undefined) {
  return useQuery({
    queryKey: packageKeys.detail(id ?? ''),
    queryFn: () => api.get<DopingPackage>(`/packages/${id}`),
    enabled: Boolean(id),
  });
}

/** Server-driven payment/invoice list (paginated envelope). */
export function usePayments(query: TableQuery) {
  return useQuery({
    queryKey: paymentKeys.list(query),
    queryFn: () => api.get<Paginated<Payment>>('/payments', toParams(query)),
    placeholderData: keepPreviousData,
  });
}

/** Single payment/invoice detail. */
export function usePayment(id: string | undefined) {
  return useQuery({
    queryKey: paymentKeys.detail(id ?? ''),
    queryFn: () => api.get<Payment>(`/payments/${id}`),
    enabled: Boolean(id),
  });
}
