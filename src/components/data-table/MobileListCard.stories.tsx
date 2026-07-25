import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { expect } from 'storybook/test';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MobileListCard } from './MobileListCard';

const meta = {
  title: 'DataTable/MobileListCard',
  component: MobileListCard,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="bg-card max-w-sm rounded-lg border border-border p-3">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
  parameters: { viewport: { defaultViewport: 'bpXs' } },
} satisfies Meta<typeof MobileListCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: '3+1 Bahçeli Daire — Kadıköy',
    to: '/listings/L-1000',
    entity: 'listing',
    selected: false,
    onToggleSelect: () => {},
    selectLabel: 'İlan satırını seç',
    badges: <Badge>Yayında</Badge>,
    meta: [
      { label: 'Kategori', value: 'Konut' },
      { label: 'Şehir', value: 'İstanbul' },
      { label: 'Fiyat', value: '4.250.000 ₺', full: true },
    ],
  },
  play: async ({ canvas }) => {
    // Curated title is an open-detail link; the select checkbox keeps bulk working.
    await expect(canvas.getByRole('link', { name: /Kadıköy/ })).toHaveAttribute('data-action', 'open-detail');
    await expect(canvas.getByRole('checkbox', { name: 'İlan satırını seç' })).toBeInTheDocument();
    await expect(canvas.getByText('Fiyat')).toBeVisible();
  },
};

export const WithActions: Story = {
  args: {
    title: 'Vitrin Paketi',
    entity: 'package',
    selected: true,
    onToggleSelect: () => {},
    selectLabel: 'Vitrin Paketi paketini seç',
    badges: (
      <>
        <Badge variant="secondary">Aktif</Badge>
        <Badge variant="outline">Vitrin</Badge>
      </>
    ),
    meta: [
      { label: 'Süre', value: '30 gün' },
      { label: 'Fiyat', value: '₺750' },
    ],
    actions: (
      <Button variant="outline" size="sm">
        Düzenle
      </Button>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Düzenle' })).toBeVisible();
    await expect(canvas.getByRole('checkbox', { name: /Vitrin Paketi/ })).toBeChecked();
  },
};

/** No selection + no detail link (e.g. audit rows). */
export const ReadOnly: Story = {
  args: {
    title: 'listing.approve',
    badges: <Badge variant="secondary">ai:moderator</Badge>,
    meta: [
      { label: 'Zaman', value: '2026-07-25 09:14' },
      { label: 'Kaynak', value: 'listing:L-1000' },
      { label: 'Gerekçe', value: 'AI güven skoru yüksek', full: true },
    ],
  },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('checkbox')).toBeNull();
    await expect(canvas.queryByRole('link')).toBeNull();
    await expect(canvas.getByText('listing.approve')).toBeVisible();
  },
};
