import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';

import { BulkActionBar } from './BulkActionBar';
import { Button } from '@/components/ui/button';

const meta = {
  title: 'DataTable/BulkActionBar',
  component: BulkActionBar,
  parameters: { layout: 'padded' },
  args: {
    selectedCount: 3,
    total: 120,
    onClear: fn(),
    onSelectAllMatching: fn(),
    children: (
      <>
        <Button size="sm" variant="outline">
          Onayla
        </Button>
        <Button size="sm" variant="outline">
          Reddet
        </Button>
      </>
    ),
  },
} satisfies Meta<typeof BulkActionBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('region', { name: 'Toplu işlemler' })).toBeInTheDocument();
    await expect(canvas.getByText('3 seçili')).toBeInTheDocument();
  },
};
export const AllMatching: Story = { args: { allMatchingSelected: true } };
export const Loading: Story = { render: () => <div className="bg-muted h-12 w-full animate-pulse rounded-lg" /> };
export const Empty: Story = { args: { selectedCount: 0 } };
export const Error: Story = { args: { selectedCount: 1 } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
