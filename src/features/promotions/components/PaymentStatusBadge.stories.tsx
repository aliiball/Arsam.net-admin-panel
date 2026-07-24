import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { PaymentStatusBadge } from './PaymentStatusBadge';
import { PAYMENT_STATUSES } from '../data/promotions';

const meta = {
  title: 'Promotions/PaymentStatusBadge',
  component: PaymentStatusBadge,
  parameters: { layout: 'centered' },
  args: { status: 'paid' },
} satisfies Meta<typeof PaymentStatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {PAYMENT_STATUSES.map((s) => (
        <PaymentStatusBadge key={s} status={s} />
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Ödendi')).toBeInTheDocument();
    await expect(canvas.getByText('Kısmi İade')).toBeInTheDocument();
  },
};
export const Loading: Story = { render: () => <div className="bg-muted h-5 w-16 animate-pulse rounded-md" /> };
export const Empty: Story = { args: { status: 'refunded' } };
export const Error: Story = { args: { status: 'failed' } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
