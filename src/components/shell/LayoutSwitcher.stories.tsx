import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { LayoutSwitcher } from './LayoutSwitcher';

const meta = {
  title: 'Shell/LayoutSwitcher',
  component: LayoutSwitcher,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof LayoutSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sidebar: Story = { globals: { layout: 'sidebar' } };
export const Topnav: Story = { globals: { layout: 'topnav' } };

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

export const OpensMenu: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Yerleşimi değiştir' }));
    const menu = await within(document.body).findByRole('menu');
    await expect(within(menu).getByText('Kenar çubuğu')).toBeInTheDocument();
    await expect(within(menu).getByText('Üst menü')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
  },
};

export const Loading: Story = {
  render: () => <div className="bg-muted size-9 animate-pulse rounded-md" />,
};
export const Empty: Story = { render: () => <LayoutSwitcher /> };
export const Error: Story = { render: () => <LayoutSwitcher /> };
