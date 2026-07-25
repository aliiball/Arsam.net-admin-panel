import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { DashboardPage } from './DashboardPage';
import { dashboardKeys, type DashboardStats } from '../api/queries';
import { listingKeys } from '@/features/listings/api/queries';
import type { TableQuery } from '@/components/data-table/types';
import {
  MOCK_LISTINGS,
  renderPage,
  seedQueryError,
  seedQueryLoading,
} from '@/features/listings/pages/page-story-utils';

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
  trends: {
    totalListings: [40, 44, 48, 52, 55, 58, 60],
    pending: [18, 16, 15, 14, 13, 12, 12],
    active: [12, 14, 15, 17, 18, 19, 20],
    rejected: [3, 4, 5, 6, 7, 8, 8],
  },
};

const EMPTY_STATS: DashboardStats = {
  totalListings: 0,
  pending: 0,
  active: 0,
  rejected: 0,
  byCategory: [],
  byStatus: [],
  trends: { totalListings: [], pending: [], active: [], rejected: [] },
};

type Mode = 'seeded' | 'loading' | 'empty' | 'error';

function render(mode: Mode = 'seeded') {
  return renderPage(<DashboardPage />, {
    path: '/',
    initialPath: '/',
    extraRoutes: [{ path: '*', element: <div /> }],
    seed: (qc) => {
      if (mode === 'loading') {
        // Real loading branch → shape-matched skeletons (KPI bars, chart/donut silhouettes).
        seedQueryLoading(qc, dashboardKeys.stats);
        seedQueryLoading(qc, listingKeys.list(PENDING_QUERY));
        return;
      }
      if (mode === 'error') {
        seedQueryError(qc, dashboardKeys.stats);
        return;
      }
      qc.setQueryData(dashboardKeys.stats, mode === 'empty' ? EMPTY_STATS : STATS);
      qc.setQueryData(listingKeys.list(PENDING_QUERY), {
        items: mode === 'empty' ? [] : MOCK_LISTINGS.filter((l) => l.status === 'pending'),
        total: mode === 'empty' ? 0 : 12,
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
/** Tablet portrait (768px) — bento at 2-up: KPI 2-up, span-2 tiles full width. */
export const Tablet: Story = { parameters: { viewport: { defaultViewport: 'bpLg' } } };
/** Desktop (1024px) — full bento at 4-up: KPI 4-up, span-2 chart/pending tiles half width. */
export const Desktop: Story = {
  parameters: { viewport: { defaultViewport: 'bpXl' } },
  play: async ({ canvas, canvasElement }) => {
    await expect(await canvas.findByText('Toplam İlan')).toBeInTheDocument();
    // Sparklines render inside KPI tiles when a trend series is seeded (decorative,
    // aria-hidden). Assert at least one sparkline slot is present.
    await expect(canvasElement.querySelector('[data-slot="kpi-sparkline"]')).not.toBeNull();
  },
};
/** Loading — real loading branch: shape-matched KPI bars + bar-chart/donut silhouettes. */
export const Loading: Story = {
  render: () => render('loading'),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-slot="chart-skeleton"]')).not.toBeNull();
    await expect(canvasElement.querySelector('[data-slot="donut-skeleton"]')).not.toBeNull();
  },
};
/** Empty — zero listings: empty charts + empty pending/decisions tiles. */
export const Empty: Story = {
  render: () => render('empty'),
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Bekleyen ilan yok')).toBeInTheDocument();
  },
};
/** Error — real `isError` branch: the whole bento is replaced by a retry ErrorState. */
export const Error: Story = {
  render: () => render('error'),
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole('alert')).toBeInTheDocument();
    await expect(canvas.getByText('Panel yüklenemedi')).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Tekrar dene' })).toBeInTheDocument();
  },
};
