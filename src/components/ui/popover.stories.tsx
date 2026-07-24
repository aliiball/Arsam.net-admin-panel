import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Button } from './button';

const meta = {
  title: 'UI/Popover',
  component: Popover,
  parameters: { layout: 'centered' },
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger asChild>
        <Button variant="outline">Aç</Button>
      </PopoverTrigger>
      <PopoverContent>
        <p className="text-sm">Popover içeriği. Odak yönetimi ve dışına tıklama desteklenir.</p>
      </PopoverContent>
    </Popover>
  ),
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Aç' }));
    await expect(await within(document.body).findByText(/Popover içeriği/)).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
  },
};
export const Loading: Story = { args: { open: true }, render: () => (
  <Popover open>
    <PopoverTrigger asChild><Button variant="outline">Aç</Button></PopoverTrigger>
    <PopoverContent><div className="bg-muted h-16 w-full animate-pulse rounded" /></PopoverContent>
  </Popover>
) };
export const Empty: Story = { render: () => (
  <Popover>
    <PopoverTrigger asChild><Button variant="outline">Aç</Button></PopoverTrigger>
    <PopoverContent><p className="text-muted-foreground text-sm">İçerik yok.</p></PopoverContent>
  </Popover>
) };
export const Error: Story = { render: () => (
  <Popover>
    <PopoverTrigger asChild><Button variant="outline">Aç</Button></PopoverTrigger>
    <PopoverContent><p className="text-destructive text-sm">İçerik yüklenemedi.</p></PopoverContent>
  </Popover>
) };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
