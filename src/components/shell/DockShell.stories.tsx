import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Decorator } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import type { NotificationsPayload } from '@/features/notifications';
import { DockShell } from './DockShell';
import { CommandPaletteProvider } from './command-palette-context';
import { MobileBottomNav } from './MobileNav';
import { shellRouterDecorator } from './story-helpers';

const FIXED_NOW = new Date('2026-07-25T09:07:00');

const PAYLOAD: NotificationsPayload = {
  unread: 2,
  items: [
    { id: 'moderation-queue', kind: 'moderation', title: '2 ilan moderasyon bekliyor', to: '/listings/moderation', ts: '2026-07-24T00:00:00.000Z' },
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
        {/* AppShell renders the bottom nav globally; include it so mobile convergence is visible. */}
        <MobileBottomNav />
      </CommandPaletteProvider>
    </QueryClientProvider>
  );
};

const SampleContent = (
  <div className="mx-auto max-w-3xl">
    <h1 className="text-2xl font-semibold">Genel Bakış</h1>
    <p className="text-muted-foreground mt-1">Dock modu — kalıcı kenar çubuğu/üst menü yok.</p>
  </div>
);

const meta = {
  title: 'Shell/DockShell',
  component: DockShell,
  parameters: { layout: 'fullscreen' },
  args: { now: FIXED_NOW, children: SampleContent },
  decorators: [seeded, shellRouterDecorator({ title: 'Genel Bakış', aiEntity: 'dashboard' })],
} satisfies Meta<typeof DockShell>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Desktop (xl+) — floating command dock is the primary chrome. */
export const Desktop: Story = {
  parameters: { viewport: { defaultViewport: 'bpXl' } },
  play: async () => {
    await expect(within(document.body).getByText(/Şu an:/)).toBeInTheDocument();
    await expect(within(document.body).getByText('09:07')).toBeInTheDocument();
  },
};

/** Tablet portrait (768) — below xl, converges to the top command bar + bottom nav. */
export const Tablet: Story = {
  parameters: { viewport: { defaultViewport: 'bpLg' } },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('navigation', { name: 'Alt gezinme' })).toBeInTheDocument();
  },
};

/** Phone (480) — the floating rounded command pill + bottom nav. */
export const Phone: Story = {
  parameters: { viewport: { defaultViewport: 'bpSm' } },
  play: async ({ canvas }) => {
    // The floating pill's launcher is reachable; bottom nav is the primary nav.
    await expect(canvas.getByRole('button', { name: 'Menü ve komut aramayı aç' })).toBeInTheDocument();
    await expect(canvas.getByRole('navigation', { name: 'Alt gezinme' })).toBeInTheDocument();
  },
};

/** Small phone (320). */
export const SmallPhone: Story = { parameters: { viewport: { defaultViewport: 'bpXs' } } };
