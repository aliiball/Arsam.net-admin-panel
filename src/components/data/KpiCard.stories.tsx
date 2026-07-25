import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Building2, Clock } from 'lucide-react';

import { KpiCard } from './KpiCard';

const meta = {
  title: 'Data/KpiCard',
  component: KpiCard,
  parameters: { layout: 'padded' },
  args: { label: 'Toplam İlan', value: '1.284', icon: Building2 },
  render: (args) => <div className="w-64"><KpiCard {...args} /></div>,
} satisfies Meta<typeof KpiCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { delta: 12, hint: 'son 7 gün' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Toplam İlan')).toBeInTheDocument();
    await expect(canvas.getByText('1.284')).toBeInTheDocument();
  },
};
export const Negative: Story = { args: { label: 'Bekleyen', value: 42, icon: Clock, delta: -8 } };
export const Loading: Story = { args: { loading: true } };
export const Empty: Story = { args: { value: 0, hint: 'veri yok' } };
export const Error: Story = { args: { value: '—', hint: 'yüklenemedi' } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
/**
 * Smallest phone (320px), narrow container, long currency value: the value uses
 * `truncate` so it ellipsizes gracefully instead of overflowing the card.
 */
export const PhoneLongValue: Story = {
  args: { label: 'Toplam Gelir', value: '₺1.234.567.890', hint: 'seçili aralık' },
  parameters: { viewport: { defaultViewport: 'bpXs' } },
  render: (args) => (
    <div className="w-40">
      <KpiCard {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    const value = canvas.getByText('₺1.234.567.890');
    await expect(value).toHaveClass('truncate');
    // Truncated element never overflows its container's width.
    await expect(value.scrollWidth).toBeGreaterThanOrEqual(value.clientWidth);
  },
};
