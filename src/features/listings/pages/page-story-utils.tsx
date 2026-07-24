import type { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router-dom';

import type { Listing } from '../schemas/listing';

export const MOCK_LISTINGS: Listing[] = [
  {
    id: 'L-1000',
    title: 'İstanbul konut ilanı 1',
    description: 'Deniz manzaralı, bakımlı daire.',
    category: 'konut',
    status: 'pending',
    price: 4_250_000,
    il: '34',
    ilce: 'kadikoy',
    mahalle: 'Moda',
    attributes: { grossArea: 120, netArea: 100, rooms: '3+1', buildingAge: 5, floor: 4, heating: 'dogalgaz', deedStatus: 'kat-mulkiyeti' },
    agentName: 'Emlak Ofisi 1',
    aiSuggestion: 'uncertain',
    aiReasons: ['Fotoğraf sayısı az'],
    createdAt: '2026-06-02T00:00:00.000Z',
  },
  {
    id: 'L-1001',
    title: 'Ankara arsa ilanı 2',
    description: 'İmarlı, yola cepheli arsa.',
    category: 'arsa',
    status: 'active',
    price: 2_100_000,
    il: '06',
    ilce: 'cankaya',
    mahalle: 'Kızılay',
    attributes: { grossArea: 500, deedStatus: 'mustakil', zoning: 'konut' },
    agentName: 'Emlak Ofisi 2',
    aiSuggestion: 'ok',
    aiReasons: ['Kurallara uygun'],
    createdAt: '2026-06-03T00:00:00.000Z',
  },
];

/** QueryClient that never refetches so seeded story data stays stable. */
export function makeSeededClient(seed: (qc: QueryClient) => void): QueryClient {
  const qc = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false, refetchOnMount: false } },
  });
  seed(qc);
  return qc;
}

/** Wrap a page element in a seeded QueryClient + memory data-router. */
export function renderPage(
  element: ReactElement,
  opts: { path: string; initialPath: string; seed: (qc: QueryClient) => void; extraRoutes?: RouteObject[] },
): ReactElement {
  const client = makeSeededClient(opts.seed);
  const router = createMemoryRouter(
    [{ path: opts.path, element }, ...(opts.extraRoutes ?? [])],
    { initialEntries: [opts.initialPath] },
  );
  return (
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
