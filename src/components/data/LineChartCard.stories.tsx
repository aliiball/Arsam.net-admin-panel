import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { LineChartCard } from './LineChartCard';

const data = [
  { date: '2026-07-18', value: 12 },
  { date: '2026-07-19', value: 18 },
  { date: '2026-07-20', value: 9 },
  { date: '2026-07-21', value: 22 },
  { date: '2026-07-22', value: 15 },
  { date: '2026-07-23', value: 27 },
  { date: '2026-07-24', value: 25 },
];

const meta = {
  title: 'Data/LineChartCard',
  component: LineChartCard,
  parameters: { layout: 'padded' },
  args: {
    title: 'İlan trendi',
    description: 'Günlük yeni ilan sayısı',
    valueName: 'İlan',
    data,
  },
  render: (args) => (
    <div className="max-w-xl">
      <LineChartCard {...args} />
    </div>
  ),
} satisfies Meta<typeof LineChartCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('İlan trendi')).toBeInTheDocument();
    // The accessible data table restates every point (color is never the sole signal).
    await expect(canvas.getByText('günlük veri özeti', { exact: false })).toBeInTheDocument();
  },
};

export const Area: Story = {
  args: {
    title: 'Gelir trendi',
    description: 'Günlük net gelir (₺)',
    variant: 'area',
    valueName: 'Gelir',
    colorToken: 2,
    valueFormatter: (v: number) => `₺${v.toLocaleString('tr-TR')}`,
    data: data.map((p) => ({ ...p, value: p.value * 1500 })),
  },
};

export const Loading: Story = { args: { loading: true } };

export const Empty: Story = {
  args: { data: [] },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Görüntülenecek veri yok.')).toBeInTheDocument();
  },
};

export const Error: Story = {
  args: { title: 'Grafik yüklenemedi', data: data.map((p) => ({ ...p, value: 0 })) },
  play: async ({ canvas }) => {
    // All-zero data collapses to the empty branch.
    await expect(canvas.getByText('Görüntülenecek veri yok.')).toBeInTheDocument();
  },
};

export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
