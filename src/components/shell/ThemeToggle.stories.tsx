import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { ThemeToggle } from './ThemeToggle';

const meta = {
  title: 'Shell/ThemeToggle',
  component: ThemeToggle,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Interaction: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Tema seç' }));
    const menu = await within(document.body).findByRole('menu');
    await expect(within(menu).getByText('Koyu')).toBeInTheDocument();
    await userEvent.click(within(menu).getByText('Koyu'));
    await expect(document.documentElement).toHaveClass('dark');
  },
};

export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
export const Loading: Story = { render: () => <div className="bg-muted size-9 animate-pulse rounded-md" /> };
export const Empty: Story = { render: () => <ThemeToggle /> };
export const Error: Story = { render: () => <ThemeToggle /> };
