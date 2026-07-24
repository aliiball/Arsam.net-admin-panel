import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { TopnavMenu } from './TopnavMenu';
import { navSchema } from '@/config/nav-schema';
import { shellRouterDecorator } from './story-helpers';

const meta = {
  title: 'Shell/TopnavMenu',
  component: TopnavMenu,
  parameters: { layout: 'fullscreen' },
  decorators: [shellRouterDecorator()],
  args: { items: navSchema },
} satisfies Meta<typeof TopnavMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-full border-b border-border p-2">
      <TopnavMenu {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: /Genel Bakış/ })).toBeInTheDocument();
  },
};

export const Narrow: Story = {
  render: (args) => (
    <div className="w-[520px] border border-border p-2">
      <TopnavMenu {...args} />
    </div>
  ),
};

export const Mobile: Story = {
  ...Narrow,
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

export const Loading: Story = {
  render: () => (
    <div className="flex gap-2 p-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-muted h-8 w-24 animate-pulse rounded-md" />
      ))}
    </div>
  ),
};

export const Empty: Story = {
  render: () => <div className="text-muted-foreground p-2 text-sm">Modül yok.</div>,
  args: { items: [] },
};

export const Error: Story = {
  render: () => <div className="text-destructive p-2 text-sm">Menü hatası.</div>,
};
