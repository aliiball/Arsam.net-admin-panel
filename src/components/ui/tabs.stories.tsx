import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';

import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

const meta = {
  title: 'UI/Tabs',
  component: Tabs,
  parameters: { layout: 'centered' },
  render: (args) => (
    <Tabs defaultValue="genel" className="w-80" {...args}>
      <TabsList>
        <TabsTrigger value="genel">Genel</TabsTrigger>
        <TabsTrigger value="detay">Detay</TabsTrigger>
        <TabsTrigger value="gecmis">Geçmiş</TabsTrigger>
      </TabsList>
      <TabsContent value="genel" className="pt-3 text-sm">Genel bilgiler</TabsContent>
      <TabsContent value="detay" className="pt-3 text-sm">Detaylı bilgiler</TabsContent>
      <TabsContent value="gecmis" className="pt-3 text-sm">Değişiklik geçmişi</TabsContent>
    </Tabs>
  ),
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('tab', { name: 'Detay' }));
    await expect(canvas.getByText('Detaylı bilgiler')).toBeVisible();
  },
};
export const Loading: Story = {
  render: () => (
    <Tabs defaultValue="genel" className="w-80">
      <TabsList>
        <TabsTrigger value="genel">Genel</TabsTrigger>
      </TabsList>
      <TabsContent value="genel" className="pt-3">
        <div className="bg-muted h-16 w-full animate-pulse rounded" />
      </TabsContent>
    </Tabs>
  ),
};
export const Empty: Story = {
  render: () => (
    <Tabs defaultValue="genel" className="w-80">
      <TabsList>
        <TabsTrigger value="genel">Genel</TabsTrigger>
      </TabsList>
      <TabsContent value="genel" className="text-muted-foreground pt-3 text-sm">İçerik yok.</TabsContent>
    </Tabs>
  ),
};
export const Error: Story = {
  render: () => (
    <Tabs defaultValue="genel" className="w-80">
      <TabsList>
        <TabsTrigger value="genel">Genel</TabsTrigger>
      </TabsList>
      <TabsContent value="genel" className="text-destructive pt-3 text-sm">Yüklenemedi.</TabsContent>
    </Tabs>
  ),
};
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
