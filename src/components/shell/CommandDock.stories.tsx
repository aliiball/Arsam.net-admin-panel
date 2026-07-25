import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Decorator } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import type { NotificationsPayload } from '@/features/notifications';
import { DEFAULT_FLAGS } from '@/lib/settings/feature-flags';
import { setFeatureFlags, resetFeatureFlags } from '@/lib/settings/feature-flags-store';
import { CommandDock } from './CommandDock';
import { CommandPaletteProvider } from './command-palette-context';
import { shellRouterDecorator } from './story-helpers';

// Fixed clock so the dock's time is deterministic in browser tests.
const FIXED_NOW = new Date('2026-07-25T09:07:00');

const PAYLOAD: NotificationsPayload = {
  unread: 2,
  items: [
    { id: 'moderation-queue', kind: 'moderation', title: '2 ilan moderasyon bekliyor', to: '/listings/moderation', ts: '2026-07-24T00:00:00.000Z' },
    { id: 'a1', kind: 'audit', title: 'İlan onaylandı', description: 'listing:L-1001', to: '/listings/L-1001', ts: '2026-07-24T00:00:00.000Z' },
  ],
};

const seeded: Decorator = (Story) => {
  const qc = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false, refetchOnMount: false } },
  });
  qc.setQueryData(['notifications'], PAYLOAD);
  return (
    <QueryClientProvider client={qc}>
      <CommandPaletteProvider>
        <Story />
      </CommandPaletteProvider>
    </QueryClientProvider>
  );
};

const meta = {
  title: 'Shell/CommandDock',
  component: CommandDock,
  parameters: { layout: 'fullscreen' },
  args: { now: FIXED_NOW },
  decorators: [seeded, shellRouterDecorator({ title: 'İlanlar', aiEntity: 'listing' })],
} satisfies Meta<typeof CommandDock>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Desktop (xl+) — the floating rich-glass command dock is visible. */
export const Default: Story = {
  parameters: { viewport: { defaultViewport: 'bpXl' } },
  play: async () => {
    await expect(within(document.body).getByText(/Şu an:/)).toBeInTheDocument();
    await expect(within(document.body).getByText('İlanlar')).toBeInTheDocument();
    await expect(within(document.body).getByText('09:07')).toBeInTheDocument();
    await expect(
      within(document.body).getByRole('button', { name: 'Menü ve komut aramayı aç' }),
    ).toBeInTheDocument();
    // Notification bell present with the default flag on.
    await expect(
      within(document.body).getByRole('button', { name: /Bildirimler/ }),
    ).toBeInTheDocument();
  },
};

/** With `notificationCenter` OFF the bell is not rendered in the dock. */
export const NotificationsOff: Story = {
  parameters: { viewport: { defaultViewport: 'bpXl' } },
  beforeEach: () => {
    setFeatureFlags({ ...DEFAULT_FLAGS, notificationCenter: false });
    return () => resetFeatureFlags();
  },
  play: async () => {
    await expect(within(document.body).getByText(/Şu an:/)).toBeInTheDocument();
    await expect(
      within(document.body).queryByRole('button', { name: /Bildirimler/ }),
    ).toBeNull();
  },
};

