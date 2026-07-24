import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { DonutChartCard } from './DonutChartCard';

const data = [
  { name: 'Yayında', value: 42 },
  { name: 'Beklemede', value: 12 },
  { name: 'Reddedildi', value: 6 },
  { name: 'Taslak', value: 9 },
  { name: 'Süresi doldu', value: 4 },
];

const meta = {
  title: 'Data/DonutChartCard',
  component: DonutChartCard,
  parameters: { layout: 'padded' },
  args: {
    title: 'Duruma göre dağılım',
    description: 'İlan yaşam döngüsü',
    centerLabel: 'ilan',
    data,
  },
  render: (args) => (
    <div className="max-w-md">
      <DonutChartCard {...args} />
    </div>
  ),
} satisfies Meta<typeof DonutChartCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Duruma göre dağılım')).toBeInTheDocument();
    // Center total = sum of slice values.
    await expect(canvas.getByText('73')).toBeInTheDocument();
    // Legend entries render with labels.
    await expect(canvas.getByText('Yayında')).toBeInTheDocument();
  },
};

export const Loading: Story = { args: { data: [], description: 'Veri getiriliyor' } };

export const Empty: Story = {
  args: { data: [], description: 'Görüntülenecek kayıt yok' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Görüntülenecek veri yok.')).toBeInTheDocument();
  },
};

export const Error: Story = {
  args: { data: [], title: 'Grafik yüklenemedi', description: 'Bir hata oluştu' },
};

export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
