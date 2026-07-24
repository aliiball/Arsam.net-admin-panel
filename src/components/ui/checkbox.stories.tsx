import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';

import { Checkbox } from './checkbox';
import { Label } from './label';

const meta = {
  title: 'UI/Checkbox',
  component: Checkbox,
  parameters: { layout: 'centered' },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox id="c" {...args} />
      <Label htmlFor="c">Şartları kabul ediyorum</Label>
    </div>
  ),
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const cb = canvas.getByRole('checkbox');
    await userEvent.click(cb);
    await expect(cb).toBeChecked();
  },
};
export const Loading: Story = { args: { disabled: true } };
export const Empty: Story = { args: { checked: false } };
export const Indeterminate: Story = { args: { checked: 'indeterminate' } };
export const Error: Story = { args: { 'aria-invalid': true } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
