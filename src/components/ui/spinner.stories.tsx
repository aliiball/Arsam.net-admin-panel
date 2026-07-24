import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Spinner } from './spinner';

const meta = {
  title: 'UI/Spinner',
  component: Spinner,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('status')).toBeInTheDocument();
  },
};
export const Loading: Story = { args: { label: 'İşleniyor…' } };
export const Empty: Story = { render: () => <Spinner className="opacity-40" /> };
export const Error: Story = { render: () => <Spinner className="text-destructive" label="Yeniden deneniyor" /> };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
