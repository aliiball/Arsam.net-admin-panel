import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { CategoriesListPage } from './CategoriesListPage';
import { categoryKeys } from '../api/queries';
import { MOCK_CATEGORIES, renderPage } from './page-story-utils';

const defaultQuery = { page: 1, pageSize: 25, sort: [], filters: {}, q: '' };

function seedList(items = MOCK_CATEGORIES) {
  return (qc: Parameters<Parameters<typeof renderPage>[1]['seed']>[0]) =>
    qc.setQueryData(categoryKeys.list(defaultQuery), {
      items,
      total: items.length,
      page: 1,
      pageSize: 25,
    });
}

function render(seed = seedList()) {
  return renderPage(<CategoriesListPage />, {
    path: '/categories',
    initialPath: '/categories',
    extraRoutes: [{ path: '*', element: <div /> }],
    seed,
  });
}

const meta = {
  title: 'Categories/Pages/List',
  parameters: { layout: 'fullscreen' },
  render: () => render(),
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sidebar: Story = {
  globals: { layout: 'sidebar' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: /Kategoriler/ })).toBeInTheDocument();
    await expect((await canvas.findAllByText('Konut')).length).toBeGreaterThan(0);
  },
};
export const Topnav: Story = { globals: { layout: 'topnav' } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
export const Loading: Story = { render: () => render(() => {}) };
export const Empty: Story = { render: () => render(seedList([])) };
export const Error: Story = { render: () => render(seedList([])) };
