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

/** Shape-matched loading: a ring + legend-line silhouette. */
export const Loading: Story = {
  args: { data: [], description: 'Veri getiriliyor', loading: true },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-slot="donut-skeleton"]')).not.toBeNull();
  },
};

export const Empty: Story = {
  args: { data: [], description: 'Görüntülenecek kayıt yok' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Görüntülenecek veri yok.')).toBeInTheDocument();
  },
};

export const Error: Story = {
  args: { data: [], title: 'Grafik yüklenemedi', description: 'Bir hata oluştu' },
};

/**
 * Narrow column (below the ~26rem container-query threshold): donut + legend stack
 * vertically instead of overflowing side-by-side. This is what makes the dashboard
 * bento safe when the donut sits in a half-width column. Asserts the stacked
 * (column) layout via computed flex-direction, so it holds regardless of viewport.
 */
export const NarrowColumn: Story = {
  render: (args) => (
    <div className="w-64">
      <DonutChartCard {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const layout = canvasElement.querySelector<HTMLElement>('[data-slot="donut-layout"]');
    await expect(layout).not.toBeNull();
    await expect(getComputedStyle(layout!).flexDirection).toBe('column');
  },
};

export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
