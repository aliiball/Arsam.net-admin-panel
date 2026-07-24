import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './command';

const meta = {
  title: 'UI/Command',
  component: Command,
  parameters: { layout: 'centered' },
  render: () => (
    <Command className="w-72 rounded-md border border-border">
      <CommandInput placeholder="Ara…" />
      <CommandList>
        <CommandEmpty>Sonuç yok.</CommandEmpty>
        <CommandGroup heading="İlanlar">
          <CommandItem>Tüm ilanlar</CommandItem>
          <CommandItem>Moderasyon kuyruğu</CommandItem>
          <CommandItem>Yeni ilan</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
} satisfies Meta<typeof Command>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await userEvent.type(canvas.getByPlaceholderText('Ara…'), 'moder');
    await expect(canvas.getByText('Moderasyon kuyruğu')).toBeInTheDocument();
  },
};
export const Loading: Story = {
  render: () => (
    <div className="w-72 space-y-2 rounded-md border border-border p-2">
      <div className="bg-muted h-9 w-full animate-pulse rounded" />
      <div className="bg-muted h-6 w-full animate-pulse rounded" />
    </div>
  ),
};
export const Empty: Story = {
  play: async ({ canvas }) => {
    await userEvent.type(canvas.getByPlaceholderText('Ara…'), 'zzz');
    await expect(canvas.getByText('Sonuç yok.')).toBeInTheDocument();
  },
};
export const Error: Story = {
  render: () => (
    <div className="text-destructive w-72 rounded-md border border-destructive/40 p-4 text-sm">
      Komutlar yüklenemedi.
    </div>
  ),
};
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
