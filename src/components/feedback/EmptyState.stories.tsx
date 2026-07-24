import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { FileSearch } from 'lucide-react';

import { EmptyState } from './EmptyState';
import { Button } from '@/components/ui/button';

const meta = {
  title: 'Feedback/EmptyState',
  component: EmptyState,
  parameters: { layout: 'padded' },
  args: {
    title: 'Henüz ilan yok',
    description: 'Filtrelerinizi değiştirin ya da yeni bir ilan oluşturun.',
  },
  render: (args) => <div className="max-w-md"><EmptyState {...args} /></div>,
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { action: <Button size="sm">Yeni ilan</Button> },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Henüz ilan yok')).toBeInTheDocument();
  },
};
export const Loading: Story = {
  render: () => <div className="bg-muted mx-auto h-40 w-full max-w-md animate-pulse rounded-lg" />,
};
export const Empty: Story = {};
export const Error: Story = { args: { icon: FileSearch, title: 'Sonuç bulunamadı', description: 'Arama kriterlerinize uygun kayıt yok.' } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
