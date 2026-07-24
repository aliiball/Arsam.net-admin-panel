import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { UserStatusBadge } from './UserStatusBadge';
import { USER_STATUSES } from '../data/users';

const meta = {
  title: 'Users/UserStatusBadge',
  component: UserStatusBadge,
  parameters: { layout: 'centered' },
  args: { status: 'active' },
} satisfies Meta<typeof UserStatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {USER_STATUSES.map((s) => (
        <UserStatusBadge key={s} status={s} />
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Aktif')).toBeInTheDocument();
  },
};
export const Loading: Story = { render: () => <div className="bg-muted h-5 w-16 animate-pulse rounded-md" /> };
export const Empty: Story = { args: { status: 'pending' } };
export const Error: Story = { args: { status: 'banned' } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
