import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { ListingStatusBadge } from './ListingStatusBadge';
import { STATUSES } from '../data/taxonomy';

const meta = {
  title: 'Listings/ListingStatusBadge',
  component: ListingStatusBadge,
  parameters: { layout: 'centered' },
  args: { status: 'active' },
} satisfies Meta<typeof ListingStatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {STATUSES.map((s) => (
        <ListingStatusBadge key={s} status={s} />
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Yayında')).toBeInTheDocument();
  },
};
export const Loading: Story = { render: () => <div className="bg-muted h-5 w-16 animate-pulse rounded-md" /> };
export const Empty: Story = { args: { status: 'draft' } };
export const Error: Story = { args: { status: 'rejected' } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
