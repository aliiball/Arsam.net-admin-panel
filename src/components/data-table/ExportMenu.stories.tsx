import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { ExportMenu } from './ExportMenu';

const meta = {
  title: 'DataTable/ExportMenu',
  component: ExportMenu,
  parameters: { layout: 'centered' },
  args: { selectedCount: 3, onExport: fn() },
} satisfies Meta<typeof ExportMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: /Dışa aktar/ }));
    const menu = await within(document.body).findByRole('menu');
    await userEvent.click(within(menu).getAllByText('Bu sayfa')[0]!);
    await expect(args.onExport).toHaveBeenCalledWith('csv', 'view');
  },
};
export const NoSelection: Story = { args: { selectedCount: 0 } };
export const Loading: Story = { render: () => <div className="bg-muted h-8 w-28 animate-pulse rounded-md" /> };
export const Empty: Story = { args: { selectedCount: 0 } };
export const Error: Story = { args: { selectedCount: 0 } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
