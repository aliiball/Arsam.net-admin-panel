import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { SidebarShell } from './SidebarShell';
import { CommandPaletteProvider } from './command-palette-context';
import { shellRouterDecorator } from './story-helpers';
import { LayoutProvider } from '@/lib/layout/layout-context';

const content = (
  <div className="max-w-2xl">
    <h1 className="text-xl font-semibold">İçerik alanı</h1>
    <p className="text-muted-foreground mt-1 text-sm">Kenar çubuğu daraltılabilir.</p>
  </div>
);

const meta = {
  title: 'Shell/SidebarShell',
  component: SidebarShell,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <CommandPaletteProvider>
        <Story />
      </CommandPaletteProvider>
    ),
    shellRouterDecorator(),
  ],
  args: { children: content },
} satisfies Meta<typeof SidebarShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByTestId('sidebar')).toHaveAttribute('data-collapsed', 'false');
  },
};

export const Collapsed: Story = {
  decorators: [
    (Story) => (
      <LayoutProvider initialConfig={{ sidebarCollapsed: true }} persist={false}>
        <Story />
      </LayoutProvider>
    ),
  ],
  play: async ({ canvas }) => {
    await expect(canvas.getByTestId('sidebar')).toHaveAttribute('data-collapsed', 'true');
  },
};

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

export const Loading: Story = {
  args: { children: <div className="bg-muted h-24 w-full max-w-2xl animate-pulse rounded" /> },
};

export const Empty: Story = {
  args: { children: <div className="text-muted-foreground text-sm">Boş.</div> },
};

export const Error: Story = {
  args: { children: <div className="text-destructive text-sm">Hata.</div> },
};
