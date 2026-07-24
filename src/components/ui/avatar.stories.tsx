import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Avatar, AvatarFallback, AvatarImage } from './avatar';

const meta = {
  title: 'UI/Avatar',
  component: Avatar,
  parameters: { layout: 'centered' },
  render: () => (
    <Avatar>
      <AvatarImage src="" alt="Ahmet Yönetici" />
      <AvatarFallback>AY</AvatarFallback>
    </Avatar>
  ),
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('AY')).toBeInTheDocument();
  },
};
export const Loading: Story = { render: () => <div className="bg-muted size-9 animate-pulse rounded-full" /> };
export const Empty: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>?</AvatarFallback>
    </Avatar>
  ),
};
export const Error: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback className="bg-destructive/10 text-destructive">!</AvatarFallback>
    </Avatar>
  ),
};
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
