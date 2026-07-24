import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { PackageStatusBadge } from './PackageStatusBadge';
import { PACKAGE_STATUSES } from '../data/promotions';

const meta = {
  title: 'Promotions/PackageStatusBadge',
  component: PackageStatusBadge,
  parameters: { layout: 'centered' },
  args: { status: 'active' },
} satisfies Meta<typeof PackageStatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {PACKAGE_STATUSES.map((s) => (
        <PackageStatusBadge key={s} status={s} />
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Aktif')).toBeInTheDocument();
    await expect(canvas.getByText('Arşivli')).toBeInTheDocument();
  },
};
export const Loading: Story = { render: () => <div className="bg-muted h-5 w-16 animate-pulse rounded-md" /> };
export const Empty: Story = { args: { status: 'archived' } };
export const Error: Story = { args: { status: 'archived' } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
