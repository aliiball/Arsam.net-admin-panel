import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { api, encodeListQuery } from '@/lib/api/client';
import { getAuditFor, type AuditEntry } from '@/lib/audit';
import type { Paginated } from '@/lib/api/types';
import type { TableQuery } from '@/components/data-table/types';

export const auditKeys = {
  all: ['audit'] as const,
  list: (query: TableQuery) => ['audit', 'list', query] as const,
  resource: (resource: string) => ['audit', 'resource', resource] as const,
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

/** Server-driven, filterable audit log (paginated envelope). */
export function useAuditLog(query: TableQuery) {
  return useQuery({
    queryKey: auditKeys.list(query),
    queryFn: () => api.get<Paginated<AuditEntry>>('/audit', toParams(query)),
    placeholderData: keepPreviousData,
  });
}

/**
 * Resource-scoped audit trail for a detail page. Reads the in-memory log
 * directly (synchronous, no network) so detail pages that already call
 * `getAuditFor` can keep their existing render timing.
 */
export function useAuditFor(resource: string): AuditEntry[] {
  return getAuditFor(resource);
}
