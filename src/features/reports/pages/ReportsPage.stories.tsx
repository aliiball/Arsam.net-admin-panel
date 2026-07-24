import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { ReportsPage } from './ReportsPage';
import { reportsKeys } from '../api/queries';
import { EMPTY_OVERVIEW, MOCK_OVERVIEW, renderPage, seedQueryError } from './page-story-utils';

// The page mounts with the default '30d' range, so seed that query key.
const KEY = reportsKeys.overview('30d');

function seeded(overview = MOCK_OVERVIEW) {
  return renderPage(<ReportsPage />, {
    path: '/reports',
    initialPath: '/reports',
    extraRoutes: [{ path: '*', element: <div /> }],
    seed: (qc) => qc.setQueryData(KEY, overview),
  });
}

const meta = {
  title: 'Reports/Pages/Overview',
  parameters: { layout: 'fullscreen' },
  render: () => seeded(),
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: /Raporlar & Analitik/ })).toBeInTheDocument();
    // Unique KPI values render from the seeded overview.
    await expect(canvas.getByText(/184\.500/)).toBeInTheDocument(); // Toplam Gelir
    await expect(canvas.getByText('%6.0')).toBeInTheDocument(); // İade Oranı
    // Range selector is present.
    await expect(canvas.getByRole('tab', { name: 'Son 30 gün' })).toBeInTheDocument();
    // Both trend charts render their accessible summaries.
    await expect(canvas.getByText('İlan trendi')).toBeInTheDocument();
    await expect(canvas.getByText('Gelir trendi')).toBeInTheDocument();
  },
};

export const Loading: Story = {
  render: () =>
    renderPage(<ReportsPage />, {
      path: '/reports',
      initialPath: '/reports',
      extraRoutes: [{ path: '*', element: <div /> }],
      seed: () => {},
    }),
};

export const Empty: Story = {
  render: () => seeded(EMPTY_OVERVIEW),
  play: async ({ canvas }) => {
    // Empty breakdowns + zero trends collapse to the empty branch.
    await expect((await canvas.findAllByText('Görüntülenecek veri yok.')).length).toBeGreaterThan(0);
  },
};

// A real isError state (not a mirror of Empty) — deterministic, no network.
export const Error: Story = {
  render: () =>
    renderPage(<ReportsPage />, {
      path: '/reports',
      initialPath: '/reports',
      extraRoutes: [{ path: '*', element: <div /> }],
      seed: (qc) => seedQueryError(qc, KEY),
    }),
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole('alert')).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Tekrar dene' })).toBeInTheDocument();
  },
};

export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
