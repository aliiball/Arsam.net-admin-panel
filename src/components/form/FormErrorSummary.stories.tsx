import type { Meta, StoryObj } from '@storybook/react-vite';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { expect, userEvent } from 'storybook/test';

import { Form } from './form-context';
import { FormField } from './FormField';
import { FormErrorSummary } from './FormErrorSummary';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const schema = z.object({
  title: z.string().min(3, 'En az 3 karakter'),
  price: z.string().regex(/^\d+$/, 'Fiyat girin'),
});
type Values = z.infer<typeof schema>;

function Harness() {
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { title: '', price: '' } });
  return (
    <Form {...form}>
      <form className="w-80 space-y-4" onSubmit={form.handleSubmit(() => {})} noValidate>
        <FormErrorSummary labels={{ title: 'Başlık', price: 'Fiyat' }} />
        <FormField name="title" label="Başlık" helper="İlan başlığı.">
          <Input placeholder="Örn. Deniz manzaralı daire" />
        </FormField>
        <FormField name="price" label="Fiyat" helper="TL cinsinden.">
          <Input inputMode="numeric" placeholder="0" />
        </FormField>
        <Button type="submit">Kaydet</Button>
      </form>
    </Form>
  );
}

const meta = {
  title: 'Form/FormErrorSummary',
  component: FormErrorSummary,
  parameters: { layout: 'centered' },
  render: () => <Harness />,
} satisfies Meta<typeof FormErrorSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Kaydet' }));
    const link = await canvas.findByRole('link', { name: /Başlık/ });
    await expect(link).toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: /Fiyat/ })).toBeInTheDocument();
  },
};
export const Loading: Story = { render: () => <div className="bg-muted h-20 w-80 animate-pulse rounded" /> };
export const Empty: Story = { render: () => <Harness /> };
export const Error: Story = { ...Default };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
