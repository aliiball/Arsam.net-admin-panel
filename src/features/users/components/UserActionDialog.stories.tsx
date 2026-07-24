import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { UserActionDialog } from './UserActionDialog';

const meta = {
  title: 'Users/UserActionDialog',
  component: UserActionDialog,
  parameters: { layout: 'centered' },
  args: { action: 'suspend', onConfirm: fn() },
} satisfies Meta<typeof UserActionDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Askıya al' })).toBeInTheDocument();
  },
};

export const SuspendRequiresReason: Story = {
  play: async ({ args, canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Askıya al' }));
    const dialog = within(document.body);
    const confirm = await dialog.findByRole('button', { name: 'Askıya al' });
    // Submitting without a reason must NOT call onConfirm (guardrail).
    await userEvent.click(confirm);
    await expect(args.onConfirm).not.toHaveBeenCalled();
    await userEvent.type(dialog.getByPlaceholderText(/Gerekçeyi/i), 'Şüpheli ilan aktivitesi');
    await userEvent.click(confirm);
    await waitFor(() =>
      expect(args.onConfirm).toHaveBeenCalledWith({ action: 'suspend', reason: 'Şüpheli ilan aktivitesi' }),
    );
  },
};

export const Ban: Story = { args: { action: 'ban' } };
export const Loading: Story = { args: { disabled: true } };
export const Empty: Story = { args: { action: 'unban' } };
export const Error: Story = { args: { action: 'ban', disabled: true } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
