import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { DatePicker } from './DatePicker';

function Harness(props: Partial<React.ComponentProps<typeof DatePicker>>) {
  const [date, setDate] = useState<Date | undefined>(props.value);
  return (
    <div className="w-64">
      <DatePicker value={date} onChange={setDate} {...props} />
    </div>
  );
}

const meta = {
  title: 'Form/DatePicker',
  component: DatePicker,
  parameters: { layout: 'centered' },
  render: () => <Harness />,
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: /Tarih seçin/ }));
    await expect(await within(document.body).findByRole('grid')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
  },
};
export const Preselected: Story = { render: () => <Harness value={new Date(2026, 6, 24)} /> };
export const Loading: Story = { render: () => <div className="bg-muted h-9 w-64 animate-pulse rounded-md" /> };
export const Empty: Story = { render: () => <Harness /> };
export const Error: Story = { render: () => <div className="w-64"><DatePicker aria-invalid /></div> };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
