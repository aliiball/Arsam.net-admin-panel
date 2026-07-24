import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { ReportActionDialog } from './ReportActionDialog';

const meta = {
  title: 'Messages/ReportActionDialog',
  component: ReportActionDialog,
  parameters: { layout: 'centered' },
  args: { action: 'dismiss', onConfirm: fn() },
} satisfies Meta<typeof ReportActionDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Şikayeti reddet' })).toBeInTheDocument();
  },
};

export const DismissRequiresReason: Story = {
  play: async ({ args, canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Şikayeti reddet' }));
    const dialog = within(document.body);
    const confirm = await dialog.findByRole('button', { name: 'Şikayeti reddet' });
    // Submitting without a reason must NOT call onConfirm (guardrail).
    await userEvent.click(confirm);
    await expect(args.onConfirm).not.toHaveBeenCalled();
    await userEvent.type(dialog.getByPlaceholderText(/Gerekçeyi/i), 'Şikayet asılsız bulundu');
    await userEvent.click(confirm);
    await waitFor(() =>
      expect(args.onConfirm).toHaveBeenCalledWith({ action: 'dismiss', reason: 'Şikayet asılsız bulundu' }),
    );
  },
};

export const Escalate: Story = { args: { action: 'escalate' } };
export const Loading: Story = { args: { disabled: true } };
export const Empty: Story = { args: { action: 'escalate', disabled: true } };
export const Error: Story = { args: { action: 'dismiss', disabled: true } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
