import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Topbar } from './Topbar';
import { CommandPalette } from './CommandPalette';
import { shellRouterDecorator, commandPaletteDecorator } from './story-helpers';

const meta = {
  title: 'Shell/Topbar',
  component: Topbar,
  parameters: { layout: 'fullscreen' },
  decorators: [commandPaletteDecorator, shellRouterDecorator({ title: 'Genel Bakış' })],
} satisfies Meta<typeof Topbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sidebar: Story = { globals: { layout: 'sidebar' } };
export const Topnav: Story = { globals: { layout: 'topnav' } };

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

export const OpensPalette: Story = {
  render: () => (
    <>
      <Topbar />
      <CommandPalette />
    </>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Komut paletini aç' }));
    const dialog = await within(document.body).findByRole('dialog');
    await expect(dialog).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
  },
};

export const Loading: Story = {
  render: () => (
    <div className="flex h-14 items-center gap-3 border-b border-border px-4">
      <div className="bg-muted h-4 w-32 animate-pulse rounded" />
      <div className="bg-muted ml-auto h-8 w-40 animate-pulse rounded" />
    </div>
  ),
};

export const Empty: Story = { render: () => <Topbar showBreadcrumbs={false} /> };
export const Error: Story = { render: () => <Topbar /> };
