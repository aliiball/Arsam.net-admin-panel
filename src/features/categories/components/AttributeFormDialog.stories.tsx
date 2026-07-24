import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { AttributeFormDialog } from './AttributeFormDialog';
import { MOCK_CATEGORIES } from '../pages/page-story-utils';

const existing = MOCK_CATEGORIES[0]!.attributes;

const meta = {
  title: 'Categories/AttributeFormDialog',
  component: AttributeFormDialog,
  parameters: { layout: 'centered' },
  args: { existing, onSubmit: fn() },
} satisfies Meta<typeof AttributeFormDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Nitelik ekle' })).toBeInTheDocument();
  },
};

export const CreateRejectsDuplicateKey: Story = {
  play: async ({ args, canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Nitelik ekle' }));
    const dialog = within(document.body);
    await userEvent.type(dialog.getByPlaceholderText('Brüt Alan'), 'Kopya');
    await userEvent.type(dialog.getByPlaceholderText('grossArea'), 'grossArea');
    await userEvent.click(await dialog.findByRole('button', { name: 'Ekle' }));
    // Duplicate key is blocked (guardrail): onSubmit must not fire.
    await waitFor(() => expect(dialog.getByText(/zaten var/i)).toBeInTheDocument());
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

export const Edit: Story = {
  args: { attribute: existing[0]! },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Düzenle' })).toBeInTheDocument();
  },
};

export const Loading: Story = { render: () => <div className="bg-muted h-9 w-28 animate-pulse rounded-md" /> };
export const Empty: Story = {};
export const Error: Story = { args: { attribute: existing[2]! } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
