import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { ProvinceFormDialog } from './ProvinceFormDialog';
import { MOCK_PROVINCES } from '../pages/page-story-utils';

const meta = {
  title: 'Locations/ProvinceFormDialog',
  component: ProvinceFormDialog,
  parameters: { layout: 'centered' },
  args: { onSubmit: fn() },
} satisfies Meta<typeof ProvinceFormDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Yeni il' })).toBeInTheDocument();
  },
};

export const CreateSubmits: Story = {
  play: async ({ args, canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Yeni il' }));
    const dialog = within(document.body);
    await userEvent.type(dialog.getByPlaceholderText('İstanbul'), 'Bursa');
    await userEvent.type(dialog.getByPlaceholderText('34'), '16');
    await userEvent.click(await dialog.findByRole('button', { name: 'Oluştur' }));
    await waitFor(() => expect(args.onSubmit).toHaveBeenCalled());
  },
};

export const Edit: Story = {
  args: { province: MOCK_PROVINCES[0]! },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'İli düzenle' })).toBeInTheDocument();
  },
};

export const Loading: Story = { render: () => <div className="bg-muted h-9 w-24 animate-pulse rounded-md" /> };
export const Empty: Story = {};
export const Error: Story = { args: { province: MOCK_PROVINCES[2]! } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
