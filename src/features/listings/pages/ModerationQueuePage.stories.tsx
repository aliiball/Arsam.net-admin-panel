import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { ModerationQueuePage } from './ModerationQueuePage';
import { listingKeys } from '../api/queries';
import type { TableQuery } from '@/components/data-table/types';
import { MOCK_LISTINGS, renderPage } from './page-story-utils';

const QUEUE_QUERY: TableQuery = {
  page: 1,
  pageSize: 20,
  sort: [{ id: 'createdAt', desc: false }],
  filters: { status: 'pending' },
  q: '',
};

function render(items = [MOCK_LISTINGS[0]!]) {
  return renderPage(<ModerationQueuePage />, {
    path: '/listings/moderation',
    initialPath: '/listings/moderation',
    extraRoutes: [{ path: '*', element: <div /> }],
    seed: (qc) =>
      qc.setQueryData(listingKeys.list(QUEUE_QUERY), { items, total: items.length, page: 1, pageSize: 20 }),
  });
}

const meta = {
  title: 'Listings/Pages/ModerationQueue',
  parameters: { layout: 'fullscreen' },
  render: () => render(),
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: 'Moderasyon Kuyruğu' })).toBeInTheDocument();
    await expect(await canvas.findByText('İstanbul konut ilanı 1')).toBeInTheDocument();
    await expect(canvas.getAllByRole('group', { name: 'Moderasyon kararı' }).length).toBeGreaterThan(0);
  },
};
export const Empty: Story = { render: () => render([]) };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
export const Loading: Story = { render: () => render([]) };
export const Error: Story = { render: () => render([]) };
