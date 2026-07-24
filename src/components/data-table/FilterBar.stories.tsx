import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { FilterBar } from './FilterBar';
import { useTableUrlState } from './use-table-url-state';
import { shellRouterDecorator } from '@/components/shell/story-helpers';
import type { FilterConfig } from './types';

const filters: FilterConfig[] = [
  {
    id: 'status',
    label: 'Durum',
    kind: 'faceted',
    multiple: true,
    options: [
      { value: 'active', label: 'Yayında', count: 40 },
      { value: 'pending', label: 'Beklemede', count: 12 },
      { value: 'rejected', label: 'Reddedildi', count: 8 },
    ],
  },
  { id: 'price', label: 'Fiyat', kind: 'numberRange', unit: '₺' },
  { id: 'created', label: 'Tarih', kind: 'dateRange' },
];

function Harness() {
  const state = useTableUrlState();
  return (
    <div className="p-4">
      <FilterBar tableKey="fb-demo" filters={filters} state={state} />
    </div>
  );
}

const meta = {
  title: 'DataTable/FilterBar',
  parameters: { layout: 'fullscreen' },
  decorators: [shellRouterDecorator()],
  render: () => <Harness />,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: 'Arama' })).toBeInTheDocument();
  },
};

export const SelectsFacetAndShowsChip: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: /Durum/ }));
    await userEvent.click(await within(document.body).findByText('Beklemede'));
    await expect(await canvas.findByText('Durum: Beklemede')).toBeInTheDocument();
  },
};

export const NaturalLanguage: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: /Akıllı filtre/ }));
    const box = await within(document.body).findByPlaceholderText(/İstanbul/);
    await userEvent.type(box, 'deniz manzara');
    await userEvent.click(within(document.body).getByRole('button', { name: /Öneri oluştur/ }));
    await expect(await within(document.body).findByText(/q: deniz manzara/)).toBeInTheDocument();
  },
};

export const Loading: Story = { render: () => <div className="bg-muted m-4 h-10 animate-pulse rounded" /> };
export const Empty: Story = { render: () => <Harness /> };
export const Error: Story = { render: () => <Harness /> };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
