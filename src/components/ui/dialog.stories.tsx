import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';
import { Button } from './button';

const meta = {
  title: 'UI/Dialog',
  component: Dialog,
  parameters: { layout: 'centered' },
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button>Aç</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>İlanı yayınla</DialogTitle>
          <DialogDescription>Bu ilan tüm kullanıcılara görünür olacak.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Vazgeç</Button>
          </DialogClose>
          <Button>Yayınla</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Aç' }));
    const dialog = await within(document.body).findByRole('dialog');
    await expect(within(dialog).getByText('İlanı yayınla')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
  },
};
export const Loading: Story = {
  render: () => (
    <Dialog open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yükleniyor</DialogTitle>
          <DialogDescription>Veri getiriliyor.</DialogDescription>
        </DialogHeader>
        <div className="bg-muted h-16 w-full animate-pulse rounded" />
      </DialogContent>
    </Dialog>
  ),
};
export const Empty: Story = {
  render: () => (
    <Dialog open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kayıt yok</DialogTitle>
          <DialogDescription>Görüntülenecek veri yok.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
};
export const Error: Story = {
  render: () => (
    <Dialog open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-destructive">Hata</DialogTitle>
          <DialogDescription>İşlem tamamlanamadı.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
};
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
/** Smallest phone (320px): the content keeps a 1rem gutter (`w-[calc(100%-2rem)]`). */
export const Phone: Story = { parameters: { viewport: { defaultViewport: 'bpXs' } } };
