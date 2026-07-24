import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { ConfirmDialog } from './ConfirmDialog';
import { Button } from '@/components/ui/button';

function Harness(props: Partial<React.ComponentProps<typeof ConfirmDialog>>) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Sil</Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="İlanı sil?"
        description="Bu işlem geri alınamaz."
        confirmLabel="Sil"
        destructive
        onConfirm={props.onConfirm ?? fn()}
        {...props}
      />
    </>
  );
}

const meta = {
  title: 'Feedback/ConfirmDialog',
  component: ConfirmDialog,
  parameters: { layout: 'centered' },
  args: { open: false, onOpenChange: () => {}, title: 'İlanı sil?', onConfirm: fn() },
  render: () => <Harness />,
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const onConfirm = fn();
    return <Harness onConfirm={onConfirm} />;
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Sil' }));
    const dialog = await within(document.body).findByRole('dialog');
    await expect(within(dialog).getByText('İlanı sil?')).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Sil' }));
  },
};
export const Loading: Story = {
  render: () => (
    <ConfirmDialog
      open
      onOpenChange={() => {}}
      title="İşleniyor"
      description="Lütfen bekleyin."
      onConfirm={() => new Promise(() => {})}
    />
  ),
};
export const Empty: Story = {
  render: () => (
    <ConfirmDialog open onOpenChange={() => {}} title="Onay" onConfirm={fn()} />
  ),
};
export const Error: Story = {
  render: () => (
    <ConfirmDialog
      open
      onOpenChange={() => {}}
      title="İlanı sil?"
      description="Bu işlem geri alınamaz."
      destructive
      confirmLabel="Sil"
      onConfirm={fn()}
    />
  ),
};
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
