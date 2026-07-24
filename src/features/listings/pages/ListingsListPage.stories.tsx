import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { ListingsListPage } from './ListingsListPage';
import { listingKeys } from '../api/queries';
import { MOCK_LISTINGS, renderPage } from './page-story-utils';

const defaultQuery = { page: 1, pageSize: 25, sort: [], filters: {}, q: '' };

function render() {
  return renderPage(<ListingsListPage />, {
    path: '/listings',
    initialPath: '/listings',
    extraRoutes: [{ path: '*', element: <div /> }],
    seed: (qc) =>
      qc.setQueryData(listingKeys.list(defaultQuery), {
        items: MOCK_LISTINGS,
        total: MOCK_LISTINGS.length,
        page: 1,
        pageSize: 25,
      }),
  });
}

const meta = {
  title: 'Listings/Pages/List',
  parameters: { layout: 'fullscreen' },
  render,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sidebar: Story = {
  globals: { layout: 'sidebar' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: 'İlanlar' })).toBeInTheDocument();
    await expect((await canvas.findAllByText('İstanbul konut ilanı 1')).length).toBeGreaterThan(0);
  },
};
export const Topnav: Story = { globals: { layout: 'topnav' } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
export const Loading: Story = {
  render: () =>
    renderPage(<ListingsListPage />, {
      path: '/listings',
      initialPath: '/listings',
      extraRoutes: [{ path: '*', element: <div /> }],
      seed: () => {},
    }),
};
export const Empty: Story = {
  render: () =>
    renderPage(<ListingsListPage />, {
      path: '/listings',
      initialPath: '/listings',
      extraRoutes: [{ path: '*', element: <div /> }],
      seed: (qc) =>
        qc.setQueryData(listingKeys.list(defaultQuery), { items: [], total: 0, page: 1, pageSize: 25 }),
    }),
};
export const Error: Story = { ...Empty };
