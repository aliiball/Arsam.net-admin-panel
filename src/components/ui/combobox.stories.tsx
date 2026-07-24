import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { Combobox, type ComboboxOption } from './combobox';

const options: ComboboxOption[] = [
  { value: '34', label: 'İstanbul' },
  { value: '06', label: 'Ankara' },
  { value: '35', label: 'İzmir' },
  { value: '16', label: 'Bursa' },
  { value: '07', label: 'Antalya' },
];

function ControlledCombobox(props: Partial<React.ComponentProps<typeof Combobox>>) {
  const [value, setValue] = useState('');
  return (
    <div className="w-64">
      <Combobox options={options} value={value} onValueChange={setValue} placeholder="İl seçin" {...props} />
    </div>
  );
}

const meta = {
  title: 'UI/Combobox',
  component: Combobox,
  parameters: { layout: 'centered' },
  args: { options },
  render: () => <ControlledCombobox />,
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('combobox'));
    const dialog = within(document.body);
    await userEvent.click(await dialog.findByText('İzmir'));
    await expect(canvas.getByRole('combobox')).toHaveTextContent('İzmir');
  },
};
export const Loading: Story = { render: () => <ControlledCombobox disabled /> };
export const Empty: Story = {
  render: () => <div className="w-64"><Combobox options={[]} placeholder="Seçenek yok" /></div>,
};
export const Error: Story = {
  render: () => <div className="w-64"><Combobox options={options} placeholder="Zorunlu" aria-invalid /></div>,
};
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
