import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { PackagesListPage } from './PackagesListPage';
import { packageKeys } from '../api/queries';
import { MOCK_PACKAGES, renderPage, seedQueryError } from './page-story-utils';

const defaultQuery = { page: 1, pageSize: 25, sort: [], filters: {}, q: '' };

function seededList() {
  return renderPage(<PackagesListPage />, {
    path: '/promotions',
    initialPath: '/promotions',
    extraRoutes: [{ path: '*', element: <div /> }],
    seed: (qc) =>
      qc.setQueryData(packageKeys.list(defaultQuery), {
        items: MOCK_PACKAGES,
        total: MOCK_PACKAGES.length,
        page: 1,
        pageSize: 25,
      }),
  });
}

const meta = {
  title: 'Promotions/Pages/PackagesList',
  parameters: { layout: 'fullscreen' },
  render: seededList,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sidebar: Story = {
  globals: { layout: 'sidebar' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: 'Doping Paketleri' })).toBeInTheDocument();
    await expect((await canvas.findAllByText('Öne Çıkar 7 Gün')).length).toBeGreaterThan(0);
    await expect(canvas.getByRole('button', { name: 'Yeni paket' })).toBeInTheDocument();
  },
};
export const Topnav: Story = { globals: { layout: 'topnav' } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
export const Loading: Story = {
  render: () =>
    renderPage(<PackagesListPage />, {
      path: '/promotions',
      initialPath: '/promotions',
      extraRoutes: [{ path: '*', element: <div /> }],
      seed: () => {},
    }),
};
export const Empty: Story = {
  render: () =>
    renderPage(<PackagesListPage />, {
      path: '/promotions',
      initialPath: '/promotions',
      extraRoutes: [{ path: '*', element: <div /> }],
      seed: (qc) => qc.setQueryData(packageKeys.list(defaultQuery), { items: [], total: 0, page: 1, pageSize: 25 }),
    }),
};
// A real isError state (not a mirror of Empty) — deterministic, no network.
export const Error: Story = {
  render: () =>
    renderPage(<PackagesListPage />, {
      path: '/promotions',
      initialPath: '/promotions',
      extraRoutes: [{ path: '*', element: <div /> }],
      seed: (qc) => seedQueryError(qc, packageKeys.list(defaultQuery)),
    }),
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole('alert')).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Tekrar dene' })).toBeInTheDocument();
  },
};
