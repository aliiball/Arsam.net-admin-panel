import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';

import { Textarea } from './textarea';

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  parameters: { layout: 'centered' },
  args: { placeholder: 'Açıklama…', 'aria-label': 'Açıklama' },
  render: (args) => <Textarea {...args} className="w-72" />,
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const el = canvas.getByRole('textbox');
    await userEvent.type(el, 'Satır');
    await expect(el).toHaveValue('Satır');
  },
};
export const Loading: Story = { args: { disabled: true, defaultValue: 'Yükleniyor…' } };
export const Empty: Story = { args: { defaultValue: '' } };
export const Error: Story = { args: { 'aria-invalid': true, defaultValue: 'kısa' } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
