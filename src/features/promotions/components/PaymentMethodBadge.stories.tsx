import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { PaymentMethodBadge } from './PaymentMethodBadge';
import { PAYMENT_METHODS } from '../data/promotions';

const meta = {
  title: 'Promotions/PaymentMethodBadge',
  component: PaymentMethodBadge,
  parameters: { layout: 'centered' },
  args: { method: 'card' },
} satisfies Meta<typeof PaymentMethodBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {PAYMENT_METHODS.map((m) => (
        <PaymentMethodBadge key={m} method={m} />
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    // Method reaches assistive tech via aria-label (color/icon are never the sole signal).
    await expect(canvas.getByLabelText('Yöntem: Kredi Kartı')).toBeInTheDocument();
    await expect(canvas.getByLabelText('Yöntem: Cüzdan')).toBeInTheDocument();
  },
};
export const Loading: Story = { render: () => <div className="bg-muted h-5 w-24 animate-pulse rounded-md" /> };
export const Empty: Story = { args: { method: 'transfer' } };
export const Error: Story = { args: { method: 'wallet' } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
