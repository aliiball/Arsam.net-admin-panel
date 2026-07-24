import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Label } from './label';
import { Input } from './input';

const meta = {
  title: 'UI/Label',
  component: Label,
  parameters: { layout: 'centered' },
  args: { children: 'Brüt m²' },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="grid w-64 gap-2">
      <Label htmlFor="area" {...args} />
      <Input id="area" inputMode="numeric" placeholder="120" />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Brüt m²')).toBeInTheDocument();
  },
};
export const Loading: Story = { render: () => <div className="bg-muted h-4 w-20 animate-pulse rounded" /> };
export const Empty: Story = { args: { children: '' } };
export const Error: Story = {
  render: () => <Label className="text-destructive">Zorunlu alan</Label>,
};
export const Mobile: Story = { ...Default, parameters: { viewport: { defaultViewport: 'mobile1' } } };
