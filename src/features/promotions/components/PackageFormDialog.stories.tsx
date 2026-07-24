import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { PackageFormDialog } from './PackageFormDialog';
import type { DopingPackage } from '../schemas/promotion';

const EXISTING: DopingPackage = {
  id: 'PKG-1',
  name: 'Öne Çıkar 7 Gün',
  kind: 'featured',
  durationDays: 7,
  price: 149,
  status: 'active',
  order: 0,
};

const meta = {
  title: 'Promotions/PackageFormDialog',
  component: PackageFormDialog,
  parameters: { layout: 'centered' },
  args: { onSubmit: fn() },
} satisfies Meta<typeof PackageFormDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Yeni paket' })).toBeInTheDocument();
  },
};

export const CreateValidatesNumericPrice: Story = {
  play: async ({ args, canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Yeni paket' }));
    const dialog = within(document.body);
    const submit = await dialog.findByRole('button', { name: 'Oluştur' });
    // A non-numeric price must block submit (numeric-string guardrail).
    await userEvent.type(dialog.getByPlaceholderText('Öne Çıkar 7 Gün'), 'Acil Paket');
    await userEvent.type(dialog.getByPlaceholderText('7'), '5');
    await userEvent.type(dialog.getByPlaceholderText('149'), 'abc');
    await userEvent.click(submit);
    await expect(args.onSubmit).not.toHaveBeenCalled();
    // A valid numeric price submits.
    await userEvent.clear(dialog.getByPlaceholderText('149'));
    await userEvent.type(dialog.getByPlaceholderText('149'), '199');
    await userEvent.click(submit);
    await waitFor(() => expect(args.onSubmit).toHaveBeenCalled());
  },
};

export const Edit: Story = {
  args: { pkg: EXISTING },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Paketi düzenle' }));
    const dialog = within(document.body);
    await expect(await dialog.findByDisplayValue('Öne Çıkar 7 Gün')).toBeInTheDocument();
  },
};
export const Loading: Story = { render: () => <PackageFormDialog onSubmit={fn()} /> };
export const Empty: Story = { render: () => <PackageFormDialog onSubmit={fn()} /> };
export const Error: Story = { render: () => <PackageFormDialog onSubmit={fn()} /> };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
