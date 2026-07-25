import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Decorator } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import type { NotificationsPayload } from '@/features/notifications';
import { NotificationBell } from './NotificationBell';
import { shellRouterDecorator } from './story-helpers';

const PAYLOAD: NotificationsPayload = {
  unread: 3,
  items: [
    {
      id: 'moderation-queue',
      kind: 'moderation',
      title: '3 ilan moderasyon bekliyor',
      description: 'Onay kuyruğunu incele',
      to: '/listings/moderation',
      ts: '2026-07-24T00:00:00.000Z',
    },
    { id: 'a1', kind: 'audit', title: 'İlan onaylandı', description: 'listing:L-1001', to: '/listings/L-1001', ts: '2026-07-24T00:00:00.000Z' },
    { id: 'a2', kind: 'audit', title: 'Kullanıcı askıya alındı', description: 'user:U-2', to: '/users/U-2', ts: '2026-07-23T00:00:00.000Z' },
  ],
};

type SeedState = 'ready' | 'empty' | 'loading' | 'error';

function seededClient(state: SeedState): QueryClient {
  const qc = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false, refetchOnMount: false } },
  });
  const key = ['notifications'];
  if (state === 'ready') qc.setQueryData(key, PAYLOAD);
  else if (state === 'empty') qc.setQueryData(key, { unread: 0, items: [] } satisfies NotificationsPayload);
  else {
    const query = qc.getQueryCache().build(qc, { queryKey: key });
    query.setState(
      state === 'error'
        ? // `Error` (the story export) shadows the global here — use globalThis.
          { status: 'error', error: new globalThis.Error('İstek başarısız'), fetchStatus: 'idle', data: undefined }
        : { status: 'pending', fetchStatus: 'fetching', data: undefined, error: null },
    );
  }
  return qc;
}

function seededDecorator(state: SeedState): Decorator {
  return (Story) => (
    <QueryClientProvider client={seededClient(state)}>
      <Story />
    </QueryClientProvider>
  );
}

const meta = {
  title: 'Shell/NotificationBell',
  component: NotificationBell,
  parameters: { layout: 'centered' },
  decorators: [shellRouterDecorator()],
} satisfies Meta<typeof NotificationBell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [seededDecorator('ready')],
  play: async () => {
    const bell = within(document.body).getByRole('button', { name: /Bildirimler, 3 okunmamış/ });
    await userEvent.click(bell);
    const list = await within(document.body).findByText('3 ilan moderasyon bekliyor');
    await expect(list).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
  },
};

export const Empty: Story = {
  decorators: [seededDecorator('empty')],
  play: async () => {
    const bell = within(document.body).getByRole('button', { name: 'Bildirimler' });
    await userEvent.click(bell);
    await expect(await within(document.body).findByText('Bildirim yok')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
  },
};

export const Loading: Story = { decorators: [seededDecorator('loading')] };

export const Error: Story = { decorators: [seededDecorator('error')] };

export const Mobile: Story = {
  decorators: [seededDecorator('ready')],
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
