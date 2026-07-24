import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { ModerationDecision } from './ModerationDecision';

const meta = {
  title: 'Listings/ModerationDecision',
  component: ModerationDecision,
  parameters: { layout: 'centered' },
  args: { onDecide: fn() },
} satisfies Meta<typeof ModerationDecision>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: /Yayınla/ })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: /Reddet/ })).toBeInTheDocument();
  },
};

export const ApprovesImmediately: Story = {
  play: async ({ args, canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: /Yayınla/ }));
    await expect(args.onDecide).toHaveBeenCalledWith({ decision: 'ok' });
  },
};

export const RejectRequiresReason: Story = {
  play: async ({ args, canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: /Reddet/ }));
    const popover = within(document.body);
    const confirm = await popover.findByRole('button', { name: 'Onayla' });
    await expect(confirm).toBeDisabled();
    await userEvent.type(popover.getByPlaceholderText(/gerekçesini/i), 'Eksik tapu belgesi');
    await userEvent.click(confirm);
    await expect(args.onDecide).toHaveBeenCalledWith({ decision: 'nok', reason: 'Eksik tapu belgesi' });
  },
};

export const Loading: Story = { args: { loading: true } };
export const Empty: Story = { args: { disabled: true } };
export const Error: Story = { args: { disabled: true } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
