import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';

import { ErrorState } from './ErrorState';

const meta = {
  title: 'Feedback/ErrorState',
  component: ErrorState,
  parameters: { layout: 'padded' },
  render: (args) => <div className="max-w-md"><ErrorState {...args} /></div>,
} satisfies Meta<typeof ErrorState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { onRetry: fn() },
  play: async ({ args, canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: /Tekrar dene/ }));
    await expect(args.onRetry).toHaveBeenCalled();
  },
};
export const Loading: Story = {
  render: () => <div className="bg-muted mx-auto h-40 w-full max-w-md animate-pulse rounded-lg" />,
};
export const Empty: Story = { args: { title: 'Kayıt yok', description: 'Gösterilecek veri yok.' } };
export const Error: Story = { args: { onRetry: fn() } };
export const Mobile: Story = { args: { onRetry: fn() }, parameters: { viewport: { defaultViewport: 'mobile1' } } };
