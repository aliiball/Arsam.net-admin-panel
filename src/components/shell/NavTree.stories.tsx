import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { NavTree } from './NavTree';
import { navSchema } from '@/config/nav-schema';
import { shellRouterDecorator } from './story-helpers';

const meta = {
  title: 'Shell/NavTree',
  component: NavTree,
  parameters: { layout: 'padded' },
  decorators: [shellRouterDecorator()],
  args: { items: navSchema },
} satisfies Meta<typeof NavTree>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="bg-sidebar w-64 rounded-md p-3">
      <NavTree {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'İlanlar' })).toBeInTheDocument();
  },
};

export const Collapsed: Story = {
  render: (args) => (
    <div className="bg-sidebar w-16 rounded-md p-3">
      <NavTree {...args} collapsed />
    </div>
  ),
};

export const Mobile: Story = {
  ...Default,
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

export const Loading: Story = {
  render: () => (
    <div className="w-64 space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-muted h-10 w-full animate-pulse rounded-md" />
      ))}
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div className="text-muted-foreground w-64 p-3 text-sm">Erişilebilir modül yok.</div>
  ),
  args: { items: [] },
};

export const Error: Story = {
  render: () => <div className="text-destructive w-64 p-3 text-sm">Menü yüklenemedi.</div>,
};
