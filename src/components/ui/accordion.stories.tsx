import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion';

const meta = {
  title: 'UI/Accordion',
  component: Accordion,
  parameters: { layout: 'centered' },
  args: { type: 'single', collapsible: true },
  render: () => (
    <Accordion type="single" collapsible className="w-80">
      <AccordionItem value="a">
        <AccordionTrigger>Tapu durumu nedir?</AccordionTrigger>
        <AccordionContent>Kat mülkiyeti, kat irtifakı veya hisseli tapu olabilir.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>İmar durumu neden önemli?</AccordionTrigger>
        <AccordionContent>Arsa ilanlarında yapılaşma koşullarını belirler.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: /Tapu durumu/ }));
    await expect(canvas.getByText(/Kat mülkiyeti/)).toBeVisible();
  },
};
export const Loading: Story = {
  render: () => (
    <div className="w-80 space-y-2">
      <div className="bg-muted h-10 w-full animate-pulse rounded" />
      <div className="bg-muted h-10 w-full animate-pulse rounded" />
    </div>
  ),
};
export const Empty: Story = {
  render: () => <div className="text-muted-foreground w-80 text-sm">Soru yok.</div>,
};
export const Error: Story = {
  render: () => <div className="text-destructive w-80 text-sm">Yüklenemedi.</div>,
};
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
