import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { ListingDetailPage } from './ListingDetailPage';
import { listingKeys } from '../api/queries';
import { MOCK_LISTINGS, renderPage } from './page-story-utils';

function render(seed: 'ok' | 'empty' = 'ok') {
  return renderPage(<ListingDetailPage />, {
    path: '/listings/:id',
    initialPath: '/listings/L-1000',
    extraRoutes: [{ path: '*', element: <div /> }],
    seed: (qc) => {
      if (seed === 'ok') qc.setQueryData(listingKeys.detail('L-1000'), MOCK_LISTINGS[0]);
    },
  });
}

const meta = {
  title: 'Listings/Pages/Detail',
  parameters: { layout: 'fullscreen' },
  render: () => render('ok'),
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('İstanbul konut ilanı 1')).toBeInTheDocument();
    await expect(canvas.getByRole('group', { name: 'Moderasyon kararı' })).toBeInTheDocument();
  },
};
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
export const Loading: Story = { render: () => render('empty') };
export const Empty: Story = { render: () => render('empty') };
export const Error: Story = { render: () => render('empty') };
