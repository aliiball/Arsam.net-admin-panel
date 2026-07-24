import type { Province } from '../schemas/location';

// Reuse the seeded-client + memory-router harness from the listings vertical.
export { renderPage, makeSeededClient } from '@/features/listings/pages/page-story-utils';

export const MOCK_PROVINCES: Province[] = [
  {
    id: 'P-34',
    code: '34',
    label: 'İstanbul',
    order: 0,
    status: 'active',
    districts: [
      {
        id: 'P-34-D-0',
        key: 'kadikoy',
        label: 'Kadıköy',
        order: 0,
        status: 'active',
        neighborhoods: [
          { id: 'P-34-D-0-N-0', name: 'Moda', order: 0 },
          { id: 'P-34-D-0-N-1', name: 'Caferağa', order: 1 },
          { id: 'P-34-D-0-N-2', name: 'Fenerbahçe', order: 2 },
        ],
      },
      {
        id: 'P-34-D-1',
        key: 'besiktas',
        label: 'Beşiktaş',
        order: 1,
        status: 'active',
        neighborhoods: [
          { id: 'P-34-D-1-N-0', name: 'Levent', order: 0 },
          { id: 'P-34-D-1-N-1', name: 'Etiler', order: 1 },
        ],
      },
    ],
  },
  {
    id: 'P-06',
    code: '06',
    label: 'Ankara',
    order: 1,
    status: 'active',
    districts: [
      {
        id: 'P-06-D-0',
        key: 'cankaya',
        label: 'Çankaya',
        order: 0,
        status: 'active',
        neighborhoods: [{ id: 'P-06-D-0-N-0', name: 'Kızılay', order: 0 }],
      },
    ],
  },
  {
    id: 'P-35',
    code: '35',
    label: 'İzmir',
    order: 2,
    status: 'archived',
    districts: [
      {
        id: 'P-35-D-0',
        key: 'konak',
        label: 'Konak',
        order: 0,
        status: 'active',
        neighborhoods: [{ id: 'P-35-D-0-N-0', name: 'Alsancak', order: 0 }],
      },
    ],
  },
];
