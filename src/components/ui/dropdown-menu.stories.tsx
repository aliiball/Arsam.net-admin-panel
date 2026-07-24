import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Button } from './button';

const meta = {
  title: 'UI/DropdownMenu',
  component: DropdownMenu,
  parameters: { layout: 'centered' },
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Aksiyonlar</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>İlan</DropdownMenuLabel>
        <DropdownMenuItem>Düzenle</DropdownMenuItem>
        <DropdownMenuItem>Kopyala</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Sil</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Aksiyonlar' }));
    const menu = await within(document.body).findByRole('menu');
    await expect(within(menu).getByText('Düzenle')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
  },
};
export const Loading: Story = { args: { open: true } };
export const Empty: Story = {
  render: () => (
    <DropdownMenu open>
      <DropdownMenuTrigger asChild><Button variant="outline">Boş</Button></DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Öğe yok</DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
export const Error: Story = {
  render: () => (
    <DropdownMenu open>
      <DropdownMenuTrigger asChild><Button variant="outline">Hata</Button></DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem variant="destructive">Yüklenemedi</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
