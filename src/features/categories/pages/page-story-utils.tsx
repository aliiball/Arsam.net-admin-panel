import type { Category } from '../schemas/category';

// Reuse the seeded-client + memory-router harness from the listings vertical.
export { renderPage, makeSeededClient, seedQueryError } from '@/features/listings/pages/page-story-utils';

export const MOCK_CATEGORIES: Category[] = [
  {
    id: 'C-100',
    key: 'konut',
    label: 'Konut',
    description: 'Daire, villa, müstakil ev ve rezidans ilanları.',
    icon: 'Home',
    order: 0,
    status: 'active',
    attributes: [
      { id: 'C-100-A-0', key: 'grossArea', label: 'Brüt Alan', type: 'number', required: true, unit: 'm²', order: 0 },
      { id: 'C-100-A-1', key: 'rooms', label: 'Oda Sayısı', type: 'text', required: false, order: 1 },
      {
        id: 'C-100-A-2',
        key: 'heating',
        label: 'Isıtma',
        type: 'select',
        required: false,
        order: 2,
        options: [
          { value: 'dogalgaz', label: 'Doğalgaz (kombi)' },
          { value: 'merkezi', label: 'Merkezi' },
          { value: 'yok', label: 'Yok' },
        ],
      },
    ],
  },
  {
    id: 'C-101',
    key: 'arsa',
    label: 'Arsa',
    description: 'Konut, ticari, tarla ve sanayi imarlı arsa ilanları.',
    icon: 'LandPlot',
    order: 1,
    status: 'active',
    attributes: [
      { id: 'C-101-A-0', key: 'grossArea', label: 'Brüt Alan', type: 'number', required: true, unit: 'm²', order: 0 },
      {
        id: 'C-101-A-1',
        key: 'zoning',
        label: 'İmar Durumu',
        type: 'select',
        required: true,
        order: 1,
        options: [
          { value: 'konut', label: 'Konut İmarlı' },
          { value: 'ticari', label: 'Ticari İmarlı' },
        ],
      },
    ],
  },
  {
    id: 'C-102',
    key: 'devremulk',
    label: 'Devremülk',
    description: 'Dönemsel kullanım hakkı tanıyan devremülk ilanları.',
    icon: 'CalendarClock',
    order: 2,
    status: 'archived',
    attributes: [
      { id: 'C-102-A-0', key: 'grossArea', label: 'Brüt Alan', type: 'number', required: true, unit: 'm²', order: 0 },
    ],
  },
];
