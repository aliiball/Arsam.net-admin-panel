import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { FormSection } from './FormSection';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const meta = {
  title: 'Form/FormSection',
  component: FormSection,
  parameters: { layout: 'padded' },
  args: { title: 'Konum bilgileri', description: 'İlanın bulunduğu adres.' },
  render: (args) => (
    <div className="max-w-md">
      <FormSection {...args}>
        <div className="grid gap-1.5">
          <Label htmlFor="il">İl</Label>
          <Input id="il" placeholder="İstanbul" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="ilce">İlçe</Label>
          <Input id="ilce" placeholder="Kadıköy" />
        </div>
      </FormSection>
    </div>
  ),
} satisfies Meta<typeof FormSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Konum bilgileri')).toBeInTheDocument();
  },
};
export const WithAction: Story = { args: { action: <Button size="sm" variant="outline">Ekle</Button> } };
export const Loading: Story = { render: () => <div className="bg-muted h-32 w-full max-w-md animate-pulse rounded" /> };
export const Empty: Story = { args: { title: 'Boş bölüm', description: undefined }, render: (args) => (
  <div className="max-w-md"><FormSection {...args}><p className="text-muted-foreground text-sm">Alan yok.</p></FormSection></div>
) };
export const Error: Story = { args: { title: 'Hatalı bölüm' }, render: (args) => (
  <div className="max-w-md"><FormSection {...args}><p className="text-destructive text-sm">Yüklenemedi.</p></FormSection></div>
) };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
