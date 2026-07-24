import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Badge } from './badge';

const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: { layout: 'centered' },
  args: { children: 'Aktif' },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>Yayında</Badge>
      <Badge variant="secondary">Taslak</Badge>
      <Badge variant="success">Onaylandı</Badge>
      <Badge variant="warning">Beklemede</Badge>
      <Badge variant="destructive">Reddedildi</Badge>
      <Badge variant="outline">Arşiv</Badge>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Onaylandı')).toBeInTheDocument();
  },
};
export const Loading: Story = { render: () => <div className="bg-muted h-5 w-16 animate-pulse rounded-md" /> };
export const Empty: Story = { args: { children: '—', variant: 'outline' } };
export const Error: Story = { args: { children: 'Hata', variant: 'destructive' } };
export const Mobile: Story = { ...Default, parameters: { viewport: { defaultViewport: 'mobile1' } } };
