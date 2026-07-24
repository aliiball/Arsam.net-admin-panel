import { http, HttpResponse } from 'msw';

import { API_BASE_URL } from '@/lib/api/client';
import { getAuditLog, type AuditEntry } from '@/lib/audit';
import type { Paginated, SortSpec } from '@/lib/api/types';
import { filterAuditEntries, type AuditFilter } from '../lib/audit-utils';

function parseSort(raw: string | null): SortSpec[] {
  if (!raw) return [];
  const first = raw.split(',')[0];
  if (!first) return [];
  const [id, dir] = first.split(':');
  if (!id) return [];
  return [{ id, desc: dir === 'desc' }];
}

/** Build the pure filter descriptor from the request URL. */
function filterFromUrl(url: URL): AuditFilter {
  const filter: AuditFilter = {
    families: url.searchParams.getAll('family'),
    actorKinds: url.searchParams.getAll('actorKind'),
    from: url.searchParams.get('tsFrom'),
    to: url.searchParams.get('tsTo'),
    sort: parseSort(url.searchParams.get('sort')),
  };
  const q = url.searchParams.get('q');
  if (q) filter.q = q;
  return filter;
}

function queryAudit(url: URL): Paginated<AuditEntry> {
  const page = Number(url.searchParams.get('page') ?? '1');
  const pageSize = Number(url.searchParams.get('pageSize') ?? '25');
  // Read-only: `getAuditLog()` is the live, append-only log written by every
  // vertical. This module NEVER writes to it.
  const items = filterAuditEntries(getAuditLog(), filterFromUrl(url));
  const total = items.length;
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total, page, pageSize };
}

export const auditHandlers = [
  http.get(`${API_BASE_URL}/audit`, ({ request }) => HttpResponse.json(queryAudit(new URL(request.url)))),
];
