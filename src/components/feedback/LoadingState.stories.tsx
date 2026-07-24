import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { LoadingState } from './LoadingState';

const meta = {
  title: 'Feedback/LoadingState',
  component: LoadingState,
  parameters: { layout: 'padded' },
  render: (args) => <div className="max-w-md"><LoadingState {...args} /></div>,
} satisfies Meta<typeof LoadingState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('status')).toBeInTheDocument();
  },
};
export const Loading: Story = {};
export const Empty: Story = { args: { label: 'Veri bekleniyor…' } };
export const Error: Story = { args: { label: 'Yeniden deneniyor…' } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
