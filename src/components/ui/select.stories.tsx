import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './select';

const meta = {
  title: 'UI/Select',
  component: Select,
  parameters: { layout: 'centered' },
  render: (args) => (
    <Select {...args}>
      <SelectTrigger className="w-56" aria-label="Isıtma tipi">
        <SelectValue placeholder="Isıtma seçin" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Isıtma</SelectLabel>
          <SelectItem value="dogalgaz">Doğalgaz (kombi)</SelectItem>
          <SelectItem value="merkezi">Merkezi</SelectItem>
          <SelectItem value="klima">Klima</SelectItem>
          <SelectItem value="yok">Yok</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('combobox'));
    const listbox = await within(document.body).findByRole('listbox');
    await userEvent.click(within(listbox).getByText('Merkezi'));
    await expect(await canvas.findByText('Merkezi')).toBeInTheDocument();
  },
};
export const Loading: Story = { args: { disabled: true } };
export const Empty: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-56" aria-label="Boş">
        <SelectValue placeholder="Seçenek yok" />
      </SelectTrigger>
      <SelectContent>
        <div className="text-muted-foreground px-2 py-4 text-center text-sm">Seçenek yok</div>
      </SelectContent>
    </Select>
  ),
};
export const Error: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-56" aria-invalid aria-label="Hatalı">
        <SelectValue placeholder="Zorunlu" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="a">A</SelectItem>
      </SelectContent>
    </Select>
  ),
};
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
