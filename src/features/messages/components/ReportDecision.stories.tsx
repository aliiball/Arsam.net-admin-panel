import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { ReportDecision } from './ReportDecision';

const meta = {
  title: 'Messages/ReportDecision',
  component: ReportDecision,
  parameters: { layout: 'centered' },
  args: { onDecide: fn() },
} satisfies Meta<typeof ReportDecision>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: /Çözüldü/ })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: /Reddet/ })).toBeInTheDocument();
  },
};

export const ResolvesImmediately: Story = {
  play: async ({ args, canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: /Çözüldü/ }));
    await expect(args.onDecide).toHaveBeenCalledWith({ action: 'resolve' });
  },
};

export const DismissRequiresReason: Story = {
  play: async ({ args, canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: /Reddet/ }));
    const popover = within(document.body);
    const confirm = await popover.findByRole('button', { name: 'Onayla' });
    await expect(confirm).toBeDisabled();
    await userEvent.type(popover.getByPlaceholderText(/gerekçesini/i), 'Şikayet asılsız bulundu');
    await userEvent.click(confirm);
    await expect(args.onDecide).toHaveBeenCalledWith({ action: 'dismiss', reason: 'Şikayet asılsız bulundu' });
  },
};

export const Loading: Story = { args: { loading: true } };
export const Empty: Story = { args: { disabled: true } };
export const Error: Story = { args: { disabled: true } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
