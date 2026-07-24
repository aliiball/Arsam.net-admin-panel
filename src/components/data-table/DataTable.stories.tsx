import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { DataTable } from './DataTable';
import { DataTableDemo, demoColumns, DEMO_ROWS } from './story-fixtures';
import { useTableUrlState } from './use-table-url-state';
import { shellRouterDecorator } from '@/components/shell/story-helpers';

function StateHarness({ isLoading, isError, empty }: { isLoading?: boolean; isError?: boolean; empty?: boolean }) {
  const state = useTableUrlState({ defaultPageSize: 10 });
  return (
    <div className="p-4">
      <DataTable
        columns={demoColumns}
        data={empty ? [] : DEMO_ROWS.slice(0, 10)}
        total={empty ? 0 : DEMO_ROWS.length}
        state={state}
        getRowId={(r) => r.id}
        isLoading={isLoading ?? false}
        isError={isError ?? false}
        onRetry={() => {}}
      />
    </div>
  );
}

const meta = {
  title: 'DataTable/DataTable',
  parameters: { layout: 'fullscreen' },
  decorators: [shellRouterDecorator()],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DataTableDemo />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('columnheader', { name: /Başlık/ })).toBeInTheDocument();
    await expect(canvas.getAllByRole('row').length).toBeGreaterThan(1);
  },
};

export const SortsByColumn: Story = {
  render: () => <DataTableDemo />,
  play: async ({ canvas }) => {
    // Numeric columns sort descending on first click (TanStack sortDescFirst).
    await userEvent.click(within(canvas.getByRole('columnheader', { name: /Fiyat/ })).getByRole('button'));
    await waitFor(() =>
      expect(canvas.getByRole('columnheader', { name: /Fiyat/ })).toHaveAttribute('aria-sort', 'descending'),
    );
  },
};

export const FiltersByFacet: Story = {
  render: () => <DataTableDemo />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Durum filtresi' }));
    const option = await within(document.body).findByRole('checkbox', { name: 'Yayında' });
    await userEvent.click(option);
    await expect(await canvas.findByText('Durum: Yayında')).toBeInTheDocument();
  },
};

export const SelectsRowsAndShowsBulkBar: Story = {
  render: () => <DataTableDemo />,
  play: async ({ canvas }) => {
    const rowCheckbox = canvas.getByRole('checkbox', { name: /İlan 1 .* satırını seç/ });
    await userEvent.click(rowCheckbox);
    await expect(await canvas.findByRole('region', { name: 'Toplu işlemler' })).toBeInTheDocument();
  },
};

export const Loading: Story = { render: () => <StateHarness isLoading /> };
export const Empty: Story = { render: () => <StateHarness empty /> };
export const Error: Story = { render: () => <StateHarness isError /> };
export const Mobile: Story = {
  render: () => <DataTableDemo />,
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
