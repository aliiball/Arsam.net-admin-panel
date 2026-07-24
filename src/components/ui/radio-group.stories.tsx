import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';

import { RadioGroup, RadioGroupItem } from './radio-group';
import { Label } from './label';

const meta = {
  title: 'UI/RadioGroup',
  component: RadioGroup,
  parameters: { layout: 'centered' },
  render: (args) => (
    <RadioGroup defaultValue="konut" {...args}>
      {[
        ['konut', 'Konut'],
        ['isyeri', 'İşyeri'],
        ['arsa', 'Arsa'],
      ].map(([value, label]) => (
        <div key={value} className="flex items-center gap-2">
          <RadioGroupItem value={value!} id={value} />
          <Label htmlFor={value}>{label}</Label>
        </div>
      ))}
    </RadioGroup>
  ),
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const arsa = canvas.getByRole('radio', { name: 'Arsa' });
    await userEvent.click(arsa);
    await expect(arsa).toBeChecked();
  },
};
export const Loading: Story = { args: { disabled: true } };
export const Empty: Story = { render: () => <RadioGroup aria-label="Boş" /> };
export const Error: Story = {
  render: () => (
    <RadioGroup defaultValue="" aria-invalid>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="a" id="a" aria-invalid />
        <Label htmlFor="a" className="text-destructive">Seçim gerekli</Label>
      </div>
    </RadioGroup>
  ),
};
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
