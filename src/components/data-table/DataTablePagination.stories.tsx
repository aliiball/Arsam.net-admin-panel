import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';

import { DataTablePagination } from './DataTablePagination';

const meta = {
  title: 'DataTable/DataTablePagination',
  component: DataTablePagination,
  parameters: { layout: 'padded' },
  args: { page: 2, pageSize: 25, total: 240, onPageChange: fn(), onPageSizeChange: fn() },
} satisfies Meta<typeof DataTablePagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Sonraki sayfa' }));
    await expect(args.onPageChange).toHaveBeenCalledWith(2);
  },
};
export const FirstPage: Story = { args: { page: 1 } };
export const WithSelection: Story = { args: { selectedCount: 5 } };
export const Loading: Story = { render: () => <div className="bg-muted h-10 w-full animate-pulse rounded" /> };
export const Empty: Story = { args: { total: 0, page: 1 } };
export const Error: Story = { args: { total: 0, page: 1 } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
/** Smallest phone (320px): first/last collapse; a compact `x/y` counter + prev/next remain. */
export const PhoneCompact: Story = {
  parameters: { viewport: { defaultViewport: 'bpXs' } },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('button', { name: 'İlk sayfa' })).toBeNull();
    await expect(canvas.getByRole('button', { name: 'Önceki sayfa' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Sonraki sayfa' })).toBeInTheDocument();
  },
};
/** Phone (480px): the full control row returns with first/last buttons. */
export const PhoneWide: Story = {
  parameters: { viewport: { defaultViewport: 'bpSm' } },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'İlk sayfa' })).toBeInTheDocument();
  },
};
