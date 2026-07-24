import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet';
import { Button } from './button';

const meta = {
  title: 'UI/Sheet',
  component: Sheet,
  parameters: { layout: 'centered' },
  render: (args) => (
    <Sheet {...args}>
      <SheetTrigger asChild>
        <Button variant="outline">Paneli aç</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Filtreler</SheetTitle>
          <SheetDescription>Listeyi daraltmak için seçim yapın.</SheetDescription>
        </SheetHeader>
        <div className="p-4 text-sm">İçerik</div>
      </SheetContent>
    </Sheet>
  ),
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Paneli aç' }));
    const dialog = await within(document.body).findByRole('dialog');
    await expect(within(dialog).getByText('Filtreler')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
  },
};
export const Loading: Story = {
  render: () => (
    <Sheet open>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Yükleniyor</SheetTitle>
          <SheetDescription>Bekleyin.</SheetDescription>
        </SheetHeader>
        <div className="bg-muted m-4 h-16 animate-pulse rounded" />
      </SheetContent>
    </Sheet>
  ),
};
export const Empty: Story = {
  render: () => (
    <Sheet open>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Boş</SheetTitle>
          <SheetDescription>Öğe yok.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
};
export const Error: Story = {
  render: () => (
    <Sheet open>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle className="text-destructive">Hata</SheetTitle>
          <SheetDescription>Yüklenemedi.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
};
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
