import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { CascadingSelect, type CascadeLevel, type CascadeValue } from './CascadingSelect';

const DATA: Record<string, Record<string, string[]>> = {
  '34': { Kadıköy: ['Moda', 'Caferağa'], Beşiktaş: ['Levent', 'Etiler'] },
  '35': { Konak: ['Alsancak'], Bornova: ['Kazımdirik'] },
};
const IL = [
  { value: '34', label: 'İstanbul' },
  { value: '35', label: 'İzmir' },
];

const levels: CascadeLevel[] = [
  { key: 'il', label: 'İl', getOptions: () => IL },
  {
    key: 'ilce',
    label: 'İlçe',
    getOptions: (s) => Object.keys(DATA[s.il ?? ''] ?? {}).map((d) => ({ value: d, label: d })),
  },
  {
    key: 'mahalle',
    label: 'Mahalle',
    getOptions: (s) => (DATA[s.il ?? '']?.[s.ilce ?? ''] ?? []).map((m) => ({ value: m, label: m })),
  },
];

function Harness() {
  const [value, setValue] = useState<CascadeValue>({});
  return <div className="w-full max-w-2xl"><CascadingSelect levels={levels} value={value} onChange={setValue} /></div>;
}

const meta = {
  title: 'Form/CascadingSelect',
  component: CascadingSelect,
  parameters: { layout: 'padded' },
  args: { levels },
  render: () => <Harness />,
} satisfies Meta<typeof CascadingSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    // İlçe is disabled until İl is chosen.
    await expect(canvas.getByRole('combobox', { name: 'İlçe' })).toBeDisabled();
    await userEvent.click(canvas.getByRole('combobox', { name: 'İl' }));
    await userEvent.click(await within(document.body).findByText('İstanbul'));
    await expect(canvas.getByRole('combobox', { name: 'İlçe' })).toBeEnabled();
  },
};
export const Loading: Story = { render: () => <div className="bg-muted h-16 w-full max-w-2xl animate-pulse rounded" /> };
export const Empty: Story = { render: () => <div className="max-w-2xl"><CascadingSelect levels={[{ key: 'il', label: 'İl', getOptions: () => [] }]} /></div> };
export const Error: Story = { render: () => <div className="max-w-2xl"><CascadingSelect levels={levels} disabled /></div> };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
