import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';

import { Switch } from './switch';
import { Label } from './label';

const meta = {
  title: 'UI/Switch',
  component: Switch,
  parameters: { layout: 'centered' },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Switch id="s" {...args} />
      <Label htmlFor="s">Bildirimler</Label>
    </div>
  ),
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const sw = canvas.getByRole('switch');
    await userEvent.click(sw);
    await expect(sw).toBeChecked();
  },
};
export const Loading: Story = { args: { disabled: true } };
export const Empty: Story = { args: { checked: false } };
export const Error: Story = { args: { 'aria-invalid': true } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
