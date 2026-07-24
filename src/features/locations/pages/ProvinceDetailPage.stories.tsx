import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { ProvinceDetailPage } from './ProvinceDetailPage';
import { provinceKeys } from '../api/queries';
import { MOCK_PROVINCES, renderPage } from './page-story-utils';

const province = MOCK_PROVINCES[0]!;

function render(seed: Parameters<typeof renderPage>[1]['seed']) {
  return renderPage(<ProvinceDetailPage />, {
    path: '/locations/:id',
    initialPath: `/locations/${province.id}`,
    extraRoutes: [{ path: '/locations', element: <div /> }],
    seed,
  });
}

const seedDetail = (qc: Parameters<Parameters<typeof renderPage>[1]['seed']>[0]) =>
  qc.setQueryData(provinceKeys.detail(province.id), province);

const meta = {
  title: 'Locations/Pages/Detail',
  parameters: { layout: 'fullscreen' },
  render: () => render(seedDetail),
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sidebar: Story = {
  globals: { layout: 'sidebar' },
  play: async ({ canvas }) => {
    await expect((await canvas.findAllByText('İstanbul')).length).toBeGreaterThan(0);
    await expect(canvas.getByText('İlçeler & Mahalleler')).toBeInTheDocument();
    await expect(canvas.getByText('Kadıköy')).toBeInTheDocument();
  },
};
export const Topnav: Story = { globals: { layout: 'topnav' } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
export const Loading: Story = { render: () => render(() => {}) };
export const Empty: Story = { render: () => render(() => {}) };
export const Error: Story = { render: () => render(() => {}) };
