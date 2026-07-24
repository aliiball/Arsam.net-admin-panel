import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { DistrictFormDialog } from './DistrictFormDialog';
import { MOCK_PROVINCES } from '../pages/page-story-utils';

const siblings = MOCK_PROVINCES[0]!.districts;

const meta = {
  title: 'Locations/DistrictFormDialog',
  component: DistrictFormDialog,
  parameters: { layout: 'centered' },
  args: { onSubmit: fn(), existing: siblings },
} satisfies Meta<typeof DistrictFormDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'İlçe ekle' })).toBeInTheDocument();
  },
};

export const RejectsDuplicateKey: Story = {
  play: async ({ args, canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'İlçe ekle' }));
    const dialog = within(document.body);
    await userEvent.type(dialog.getByPlaceholderText('Kadıköy'), 'Kadıköy 2');
    await userEvent.type(dialog.getByPlaceholderText('kadikoy'), 'kadikoy');
    await userEvent.click(await dialog.findByRole('button', { name: 'Ekle' }));
    // Duplicate key is blocked; onSubmit is not called.
    await expect(await dialog.findByText('Bu ilçe anahtarı bu ilde zaten var.')).toBeInTheDocument();
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

export const Edit: Story = {
  args: { district: siblings[0]! },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Düzenle' })).toBeInTheDocument();
  },
};

export const Loading: Story = { render: () => <div className="bg-muted h-9 w-24 animate-pulse rounded-md" /> };
export const Empty: Story = {};
export const Error: Story = { args: { district: siblings[1]! } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
