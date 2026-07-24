import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { InlineAlert } from './InlineAlert';

const meta = {
  title: 'Feedback/InlineAlert',
  component: InlineAlert,
  parameters: { layout: 'padded' },
  args: { title: 'Bilgi', children: 'Bu alan salt okunurdur.' },
  render: (args) => <div className="max-w-md"><InlineAlert {...args} /></div>,
} satisfies Meta<typeof InlineAlert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="max-w-md space-y-3">
      <InlineAlert variant="info" title="Bilgi">Değişiklikler otomatik kaydedilir.</InlineAlert>
      <InlineAlert variant="success" title="Onaylandı">İlan yayına alındı.</InlineAlert>
      <InlineAlert variant="warning" title="Dikkat">Bu alanı değiştirmek yeniden moderasyona sokar.</InlineAlert>
      <InlineAlert variant="destructive" title="Hata">İşlem tamamlanamadı.</InlineAlert>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('alert')).toHaveLength(4);
  },
};
export const Loading: Story = {
  render: () => <div className="bg-muted h-14 w-full max-w-md animate-pulse rounded-lg" />,
};
export const Empty: Story = {
  render: () => (
    <div className="max-w-md">
      <InlineAlert variant="info">Not yok.</InlineAlert>
    </div>
  ),
};
export const Error: Story = { args: { variant: 'destructive', title: 'Hata', children: 'Sunucuya ulaşılamadı.' } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
