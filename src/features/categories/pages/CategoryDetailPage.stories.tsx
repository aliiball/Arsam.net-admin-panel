import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { CategoryDetailPage } from './CategoryDetailPage';
import { categoryKeys } from '../api/queries';
import { MOCK_CATEGORIES, renderPage } from './page-story-utils';

const category = MOCK_CATEGORIES[0]!;

function render(seed: Parameters<typeof renderPage>[1]['seed']) {
  return renderPage(<CategoryDetailPage />, {
    path: '/categories/:id',
    initialPath: `/categories/${category.id}`,
    extraRoutes: [{ path: '/categories', element: <div /> }],
    seed,
  });
}

const seedDetail = (qc: Parameters<Parameters<typeof renderPage>[1]['seed']>[0]) =>
  qc.setQueryData(categoryKeys.detail(category.id), category);

const meta = {
  title: 'Categories/Pages/Detail',
  parameters: { layout: 'fullscreen' },
  render: () => render(seedDetail),
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sidebar: Story = {
  globals: { layout: 'sidebar' },
  play: async ({ canvas }) => {
    await expect((await canvas.findAllByText('Konut')).length).toBeGreaterThan(0);
    await expect(canvas.getByText('Nitelikler')).toBeInTheDocument();
    await expect(canvas.getByText('Brüt Alan')).toBeInTheDocument();
  },
};
export const Topnav: Story = { globals: { layout: 'topnav' } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
export const Loading: Story = { render: () => render(() => {}) };
export const Empty: Story = { render: () => render(() => {}) };
export const Error: Story = { render: () => render(() => {}) };
