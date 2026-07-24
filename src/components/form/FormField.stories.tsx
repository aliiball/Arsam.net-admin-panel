import type { Meta, StoryObj } from '@storybook/react-vite';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { expect, userEvent } from 'storybook/test';

import { Form } from './form-context';
import { FormField } from './FormField';
import { Input } from '@/components/ui/input';

const schema = z.object({
  grossArea: z
    .string()
    .regex(/^\d+$/, 'Sayı girin')
    .refine((v) => Number(v) > 0, 'Pozitif olmalı'),
});
type Values = z.infer<typeof schema>;

function Harness({ withHelper = true }: { withHelper?: boolean }) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { grossArea: '' },
    mode: 'onBlur',
  });
  return (
    <Form {...form}>
      <form className="w-72" onSubmit={form.handleSubmit(() => {})} noValidate>
        <FormField
          name="grossArea"
          label="Brüt m²"
          help="Duvarlar dahil toplam alan. Net alan ayrıca girilir."
          {...(withHelper ? { helper: 'Metrekare cinsinden bir sayı girin.' } : {})}
        >
          <Input inputMode="numeric" placeholder="120" data-entity="listing" data-action="edit-field" />
        </FormField>
      </form>
    </Form>
  );
}

const meta = {
  title: 'Form/FormField',
  parameters: { layout: 'centered' },
  render: () => <Harness />,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByLabelText(/Brüt m²/)).toBeInTheDocument();
  },
};

export const ShowsError: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByPlaceholderText('120');
    await userEvent.type(input, '0');
    await userEvent.tab();
    await expect(await canvas.findByText('Pozitif olmalı')).toBeInTheDocument();
    await expect(input).toHaveAttribute('aria-invalid', 'true');
  },
};

export const Loading: Story = { render: () => <div className="bg-muted h-16 w-72 animate-pulse rounded" /> };
export const Empty: Story = { render: () => <Harness /> };
export const Error: Story = { ...ShowsError };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
