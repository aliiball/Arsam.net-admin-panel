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
