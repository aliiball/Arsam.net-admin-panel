import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';

import { DensityToggle } from './DensityToggle';

const meta = {
  title: 'Shell/DensityToggle',
  component: DensityToggle,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof DensityToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Interaction: Story = {
  play: async ({ canvas }) => {
    const before = document.documentElement.dataset.density;
    await userEvent.click(canvas.getByRole('button'));
    await expect(document.documentElement.dataset.density).not.toBe(before);
  },
};

export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
export const Loading: Story = { render: () => <div className="bg-muted size-9 animate-pulse rounded-md" /> };
export const Empty: Story = { render: () => <DensityToggle /> };
export const Error: Story = { render: () => <DensityToggle /> };
