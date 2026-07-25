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
  byStatus: [
    { status: 'active', label: 'Yayında', count: 20 },
    { status: 'pending', label: 'Beklemede', count: 12 },
    { status: 'rejected', label: 'Reddedildi', count: 8 },
    { status: 'draft', label: 'Taslak', count: 10 },
    { status: 'expired', label: 'Süresi doldu', count: 6 },
    { status: 'archived', label: 'Arşivlendi', count: 4 },
  ],
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
    // Status donut renders with real seeded data (unique legend label + title).
    await expect(canvas.getByText('Duruma göre dağılım')).toBeInTheDocument();
    await expect(canvas.getByText('Arşivlendi')).toBeInTheDocument();
  },
};
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
/** Smallest phone (320px) — KPI band drops to 1-up; all four tiles stay legible. */
export const Phone: Story = {
  parameters: { viewport: { defaultViewport: 'bpXs' } },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: 'Genel Bakış' })).toBeInTheDocument();
    // All four KPI tiles render (1-up column at this width). "Yayında" also appears
    // as a donut legend label, so assert presence via findAllByText.
    await expect(await canvas.findByText('Toplam İlan')).toBeInTheDocument();
    await expect(canvas.getByText('Bekleyen Moderasyon')).toBeInTheDocument();
    await expect((await canvas.findAllByText('Yayında')).length).toBeGreaterThan(0);
    await expect(canvas.getByText('Reddedilen')).toBeInTheDocument();
  },
};
/** Tablet portrait (768px) — KPI row 2-up, charts 2-up (task 019 content-grid regression guard). */
export const Tablet: Story = { parameters: { viewport: { defaultViewport: 'bpLg' } } };
/** Desktop (1024px) — KPI 4-up, charts/panels 3-up. */
export const Desktop: Story = { parameters: { viewport: { defaultViewport: 'bpXl' } } };
export const Loading: Story = { render: () => render(false) };
export const Empty: Story = { render: () => render(false) };
export const Error: Story = { render: () => render(false) };
