import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { FieldHelp } from './FieldHelp';

const meta = {
  title: 'Form/FieldHelp',
  component: FieldHelp,
  parameters: { layout: 'centered' },
  args: { help: 'Brüt alan; duvarlar dahil toplam alandır. Net alan ayrıca girilir.' },
} satisfies Meta<typeof FieldHelp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Yardım' }));
    await expect(await within(document.body).findByText(/Brüt alan/)).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
  },
};
export const WithWarning: Story = {
  args: { help: 'Kısa yardım.', warning: 'Bu değeri değiştirmek yeniden moderasyona sokar.' },
};
export const Loading: Story = { render: () => <div className="bg-muted size-5 animate-pulse rounded-full" /> };
export const Empty: Story = { args: { help: undefined, warning: undefined } };
export const Error: Story = { args: { warning: 'Değer beklenenden büyük.' } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
