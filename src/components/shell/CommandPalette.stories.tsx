import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CommandPalette } from './CommandPalette';
import { CommandPaletteProvider } from './command-palette-context';
import { shellRouterDecorator } from './story-helpers';

const meta = {
  title: 'Shell/CommandPalette',
  component: CommandPalette,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <CommandPaletteProvider defaultOpen>
        <Story />
      </CommandPaletteProvider>
    ),
    shellRouterDecorator(),
  ],
} satisfies Meta<typeof CommandPalette>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sidebar: Story = {
  globals: { layout: 'sidebar' },
  play: async () => {
    const dialog = await within(document.body).findByRole('dialog');
    await expect(within(dialog).getByText('Modüller')).toBeInTheDocument();
  },
};

export const Topnav: Story = { globals: { layout: 'topnav' } };

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

export const Search: Story = {
  play: async () => {
    const dialog = await within(document.body).findByRole('dialog');
    const input = within(dialog).getByPlaceholderText(/Modül ara/i);
    await userEvent.type(input, 'ilan');
    await expect(within(dialog).getByText('İlanlar')).toBeInTheDocument();
  },
};

export const Empty: Story = {
  play: async () => {
    const dialog = await within(document.body).findByRole('dialog');
    const input = within(dialog).getByPlaceholderText(/Modül ara/i);
    await userEvent.type(input, 'zzzznope');
    await expect(within(dialog).getByText('Sonuç bulunamadı.')).toBeInTheDocument();
  },
};

export const Loading: Story = {
  decorators: [(Story) => <Story />],
  render: () => (
    <div className="w-96 rounded-md border border-border p-4">
      <div className="bg-muted h-9 w-full animate-pulse rounded" />
    </div>
  ),
};

export const Error: Story = {
  decorators: [(Story) => <Story />],
  render: () => (
    <div className="text-destructive w-96 rounded-md border border-border p-4 text-sm">
      Komutlar yüklenemedi.
    </div>
  ),
};
