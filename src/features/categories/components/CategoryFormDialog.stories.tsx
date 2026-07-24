import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { CategoryFormDialog } from './CategoryFormDialog';
import { MOCK_CATEGORIES } from '../pages/page-story-utils';

const meta = {
  title: 'Categories/CategoryFormDialog',
  component: CategoryFormDialog,
  parameters: { layout: 'centered' },
  args: { onSubmit: fn() },
} satisfies Meta<typeof CategoryFormDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Yeni kategori' })).toBeInTheDocument();
  },
};

export const CreateValidatesKey: Story = {
  play: async ({ args, canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Yeni kategori' }));
    const dialog = within(document.body);
    await userEvent.type(dialog.getByPlaceholderText('Konut'), 'Ofis');
    await userEvent.type(dialog.getByPlaceholderText('konut'), 'ofis');
    await userEvent.click(await dialog.findByRole('button', { name: 'Oluştur' }));
    await waitFor(() => expect(args.onSubmit).toHaveBeenCalled());
  },
};

export const Edit: Story = {
  args: { category: MOCK_CATEGORIES[0]! },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Kategoriyi düzenle' })).toBeInTheDocument();
  },
};

export const Loading: Story = { render: () => <div className="bg-muted h-9 w-32 animate-pulse rounded-md" /> };
export const Empty: Story = {};
export const Error: Story = { args: { category: MOCK_CATEGORIES[2]! } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
