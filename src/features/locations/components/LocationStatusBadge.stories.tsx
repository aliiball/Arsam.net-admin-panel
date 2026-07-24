import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { LocationStatusBadge } from './LocationStatusBadge';
import { LOCATION_STATUSES } from '../data/locations';

const meta = {
  title: 'Locations/LocationStatusBadge',
  component: LocationStatusBadge,
  parameters: { layout: 'centered' },
  args: { status: 'active' },
} satisfies Meta<typeof LocationStatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {LOCATION_STATUSES.map((s) => (
        <LocationStatusBadge key={s} status={s} />
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Aktif')).toBeInTheDocument();
  },
};
export const Loading: Story = { render: () => <div className="bg-muted h-5 w-16 animate-pulse rounded-md" /> };
export const Empty: Story = { args: { status: 'archived' } };
export const Error: Story = { args: { status: 'archived' } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
