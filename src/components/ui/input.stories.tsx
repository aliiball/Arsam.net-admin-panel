import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';

import { Input } from './input';

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: { layout: 'centered' },
  args: { placeholder: 'Örn. Kadıköy', 'aria-label': 'Arama' },
  render: (args) => <Input {...args} className="w-64" />,
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox');
    await userEvent.type(input, 'Merhaba');
    await expect(input).toHaveValue('Merhaba');
  },
};
export const Loading: Story = { args: { disabled: true, defaultValue: 'Yükleniyor…' } };
export const Empty: Story = { args: { defaultValue: '' } };
export const Error: Story = { args: { 'aria-invalid': true, defaultValue: 'geçersiz' } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
