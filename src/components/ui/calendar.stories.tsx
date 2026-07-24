import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect } from 'storybook/test';

import { Calendar } from './calendar';

function Harness() {
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 6, 24));
  return <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border border-border" />;
}

const meta = {
  title: 'UI/Calendar',
  component: Calendar,
  parameters: { layout: 'centered' },
  render: () => <Harness />,
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('grid')).toBeInTheDocument();
  },
};
export const Loading: Story = { render: () => <div className="bg-muted size-64 animate-pulse rounded-md" /> };
export const Empty: Story = { render: () => <Calendar mode="single" className="rounded-md border border-border" /> };
export const Error: Story = { render: () => <Calendar mode="single" className="border-destructive/40 rounded-md border" /> };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
