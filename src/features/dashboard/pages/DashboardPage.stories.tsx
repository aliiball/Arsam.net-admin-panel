import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { DashboardPage } from './DashboardPage';
import { dashboardKeys, type DashboardStats } from '../api/queries';
import { listingKeys } from '@/features/listings/api/queries';
import type { TableQuery } from '@/components/data-table/types';
import { MOCK_LISTINGS, renderPage } from '@/features/listings/pages/page-story-utils';

const PENDING_QUERY: TableQuery = {
  page: 1,
  pageSize: 5,
  sort: [{ id: 'createdAt', desc: true }],
  filters: { status: 'pending' },
  q: '',
};

const STATS: DashboardStats = {
  totalListings: 60,
  pending: 12,
  active: 20,
  rejected: 8,
  byCategory: [
    { category: 'konut', label: 'Konut', count: 18 },
    { category: 'isyeri', label: 'İşyeri', count: 12 },
    { category: 'arsa', label: 'Arsa', count: 14 },
    { category: 'devremulk', label: 'Devremülk', count: 8 },
    { category: 'turistik', label: 'Turistik Tesis', count: 8 },
  ],
  byStatus: [],
};

function render(seeded = true) {
  return renderPage(<DashboardPage />, {
    path: '/',
    initialPath: '/',
    extraRoutes: [{ path: '*', element: <div /> }],
    seed: (qc) => {
      if (!seeded) return;
      qc.setQueryData(dashboardKeys.stats, STATS);
      qc.setQueryData(listingKeys.list(PENDING_QUERY), {
        items: MOCK_LISTINGS.filter((l) => l.status === 'pending'),
        total: 12,
        page: 1,
        pageSize: 5,
      });
    },
  });
}

const meta = {
  title: 'Dashboard/DashboardPage',
  parameters: { layout: 'fullscreen' },
  render: () => render(),
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: 'Genel Bakış' })).toBeInTheDocument();
    await expect(await canvas.findByText('Toplam İlan')).toBeInTheDocument();
    await expect(canvas.getByText('Kategoriye göre ilanlar')).toBeInTheDocument();
  },
};
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
export const Loading: Story = { render: () => render(false) };
export const Empty: Story = { render: () => render(false) };
export const Error: Story = { render: () => render(false) };
