import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { LocationsListPage } from './LocationsListPage';
import { provinceKeys } from '../api/queries';
import { MOCK_PROVINCES, renderPage } from './page-story-utils';

const defaultQuery = { page: 1, pageSize: 25, sort: [], filters: {}, q: '' };

function seedList(items = MOCK_PROVINCES) {
  return (qc: Parameters<Parameters<typeof renderPage>[1]['seed']>[0]) =>
    qc.setQueryData(provinceKeys.list(defaultQuery), {
      items,
      total: items.length,
      page: 1,
      pageSize: 25,
    });
}

function render(seed = seedList()) {
  return renderPage(<LocationsListPage />, {
    path: '/locations',
    initialPath: '/locations',
    extraRoutes: [{ path: '*', element: <div /> }],
    seed,
  });
}

const meta = {
  title: 'Locations/Pages/List',
  parameters: { layout: 'fullscreen' },
  render: () => render(),
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sidebar: Story = {
  globals: { layout: 'sidebar' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: 'Lokasyonlar' })).toBeInTheDocument();
    await expect((await canvas.findAllByText('İstanbul')).length).toBeGreaterThan(0);
  },
};
export const Topnav: Story = { globals: { layout: 'topnav' } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
export const Loading: Story = { render: () => render(() => {}) };
export const Empty: Story = { render: () => render(seedList([])) };
export const Error: Story = { render: () => render(seedList([])) };
