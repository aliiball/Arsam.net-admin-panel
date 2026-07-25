import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { DEFAULT_FLAGS } from '@/lib/settings/feature-flags';
import { setFeatureFlags, resetFeatureFlags } from '@/lib/settings/feature-flags-store';
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
export const Dock: Story = { globals: { layout: 'dock' } };

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

export const OpensMenu: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Yerleşimi değiştir' }));
    const menu = await within(document.body).findByRole('menu');
    await expect(within(menu).getByText('Kenar çubuğu')).toBeInTheDocument();
    await expect(within(menu).getByText('Üst menü')).toBeInTheDocument();
    // With `dockLayout` on (default) the Dock option is offered.
    await expect(within(menu).getByText('Komut dock')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
  },
};

/**
 * Feature-flag gating: with `dockLayout` OFF the "Komut dock" option disappears
 * from the switcher (existing sidebar/topnav options unaffected). Resets on
 * cleanup so sibling stories see the default (enabled) flags.
 */
export const DockFlagOff: Story = {
  beforeEach: () => {
    setFeatureFlags({ ...DEFAULT_FLAGS, dockLayout: false });
    return () => resetFeatureFlags();
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Yerleşimi değiştir' }));
    const menu = await within(document.body).findByRole('menu');
    await expect(within(menu).getByText('Kenar çubuğu')).toBeInTheDocument();
    await expect(within(menu).queryByText('Komut dock')).toBeNull();
    await userEvent.keyboard('{Escape}');
  },
};

export const Loading: Story = {
  render: () => <div className="bg-muted size-9 animate-pulse rounded-md" />,
};
export const Empty: Story = { render: () => <LayoutSwitcher /> };
export const Error: Story = { render: () => <LayoutSwitcher /> };
