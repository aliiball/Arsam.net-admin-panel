import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { NeighborhoodFormDialog } from './NeighborhoodFormDialog';
import { MOCK_PROVINCES } from '../pages/page-story-utils';

const neighborhood = MOCK_PROVINCES[0]!.districts[0]!.neighborhoods[0]!;

const meta = {
  title: 'Locations/NeighborhoodFormDialog',
  component: NeighborhoodFormDialog,
  parameters: { layout: 'centered' },
  args: { onSubmit: fn() },
} satisfies Meta<typeof NeighborhoodFormDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Mahalle ekle' })).toBeInTheDocument();
  },
};

export const CreateSubmits: Story = {
  play: async ({ args, canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Mahalle ekle' }));
    const dialog = within(document.body);
    await userEvent.type(dialog.getByPlaceholderText('Moda'), 'Rasimpaşa');
    await userEvent.click(await dialog.findByRole('button', { name: 'Ekle' }));
    await waitFor(() => expect(args.onSubmit).toHaveBeenCalled());
  },
};

export const Edit: Story = {
  args: { neighborhood },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Düzenle' })).toBeInTheDocument();
  },
};

export const Loading: Story = { render: () => <div className="bg-muted h-9 w-28 animate-pulse rounded-md" /> };
export const Empty: Story = {};
export const Error: Story = { args: { neighborhood } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
