import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Slider } from './slider';

const meta = {
  title: 'UI/Slider',
  component: Slider,
  parameters: { layout: 'centered' },
  render: (args) => <Slider {...args} className="w-64" aria-label="Fiyat aralığı" />,
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { defaultValue: [25], max: 100, step: 1 },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('slider')).toBeInTheDocument();
  },
};
export const Range: Story = { args: { defaultValue: [20, 80], max: 100, step: 1 } };
export const Loading: Story = { args: { defaultValue: [40], disabled: true } };
export const Empty: Story = { args: { defaultValue: [0], max: 100 } };
export const Error: Story = { args: { defaultValue: [100], max: 100 } };
export const Mobile: Story = {
  args: { defaultValue: [25], max: 100 },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
