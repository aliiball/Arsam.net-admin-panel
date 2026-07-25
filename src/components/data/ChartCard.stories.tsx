import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { ChartCard } from './ChartCard';

const data = [
  { label: 'Konut', count: 24 },
  { label: 'İşyeri', count: 12 },
  { label: 'Arsa', count: 18 },
  { label: 'Devremülk', count: 6 },
  { label: 'Turistik', count: 9 },
];

const meta = {
  title: 'Data/ChartCard',
  parameters: { layout: 'padded' },
  render: () => (
    <div className="max-w-xl">
      <ChartCard title="Kategoriye göre ilanlar" description="Örnek dağılım">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
          <Bar dataKey="count" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartCard>
    </div>
  ),
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Kategoriye göre ilanlar')).toBeInTheDocument();
  },
};
/** Shape-matched loading: a bar-silhouette skeleton at the chart height. */
export const Loading: Story = {
  render: () => (
    <div className="max-w-xl">
      <ChartCard title="Yükleniyor" description="Veri getiriliyor" loading>
        <BarChart data={[]}>
          <Bar dataKey="count" fill="var(--color-chart-1)" />
        </BarChart>
      </ChartCard>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-slot="chart-skeleton"]')).not.toBeNull();
  },
};
export const Empty: Story = {
  render: () => (
    <div className="max-w-xl">
      <ChartCard title="Veri yok" description="Görüntülenecek kayıt yok">
        <BarChart data={[]}>
          <Bar dataKey="count" fill="var(--color-chart-1)" />
        </BarChart>
      </ChartCard>
    </div>
  ),
};
export const Error: Story = {
  render: () => (
    <div className="max-w-xl">
      <ChartCard title="Grafik yüklenemedi" description="Bir hata oluştu">
        <BarChart data={[]}>
          <Bar dataKey="count" fill="var(--color-chart-5)" />
        </BarChart>
      </ChartCard>
    </div>
  ),
};
const summaryText = 'Kategoriye göre ilan sayıları: Konut 24, İşyeri 12, Arsa 18, Devremülk 6, Turistik 9.';

/**
 * With an accessible text alternative: the summary is rendered `sr-only` and the
 * (visual-only) chart SVG is hidden from assistive tech.
 */
export const WithSummary: Story = {
  render: () => (
    <div className="max-w-xl">
      <ChartCard title="Kategoriye göre ilanlar" description="Örnek dağılım" summary={summaryText}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
          <Bar dataKey="count" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartCard>
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    // The summary is present as an sr-only alternative…
    const summary = canvas.getByText(summaryText);
    await expect(summary).toBeInTheDocument();
    await expect(summary).toHaveClass('sr-only');
    // …and the visual chart is hidden from assistive tech to avoid double-reading.
    const viz = canvasElement.querySelector('[data-slot="chart-viz"]');
    await expect(viz).toHaveAttribute('aria-hidden', 'true');
  },
};

export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
