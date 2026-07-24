import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { RefundDialog } from './RefundDialog';

const meta = {
  title: 'Promotions/RefundDialog',
  component: RefundDialog,
  parameters: { layout: 'centered' },
  args: { remaining: 499, onConfirm: fn() },
} satisfies Meta<typeof RefundDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: /İade et/ })).toBeInTheDocument();
  },
};

export const FullRefundSubmits: Story = {
  play: async ({ args, canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: /İade et/ }));
    const dialog = within(document.body);
    const confirm = await dialog.findByRole('button', { name: 'İadeyi onayla' });
    // Full refund is on by default; a reason is still required (guardrail).
    await userEvent.click(confirm);
    await expect(args.onConfirm).not.toHaveBeenCalled();
    await userEvent.type(dialog.getByPlaceholderText(/gerekçesini/i), 'Kullanıcı talebi üzerine iade');
    await userEvent.click(confirm);
    await waitFor(() =>
      expect(args.onConfirm).toHaveBeenCalledWith({ amount: 499, reason: 'Kullanıcı talebi üzerine iade' }),
    );
  },
};

export const PartialRefund: Story = {
  play: async ({ args, canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: /İade et/ }));
    const dialog = within(document.body);
    // Turn off "Tam iade" to enter a partial amount.
    await userEvent.click(await dialog.findByRole('switch'));
    const amount = dialog.getByPlaceholderText('499');
    await userEvent.clear(amount);
    await userEvent.type(amount, '200');
    await userEvent.type(dialog.getByPlaceholderText(/gerekçesini/i), 'Kısmi iade talebi');
    await userEvent.click(dialog.getByRole('button', { name: 'İadeyi onayla' }));
    await waitFor(() =>
      expect(args.onConfirm).toHaveBeenCalledWith({ amount: 200, reason: 'Kısmi iade talebi' }),
    );
  },
};

export const Loading: Story = { args: { disabled: true } };
export const Empty: Story = { args: { remaining: 0, disabled: true } };
export const Error: Story = { args: { disabled: true } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
