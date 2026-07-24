import type { ReactElement } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { expect, userEvent, within } from 'storybook/test';

import { listingKeys } from '@/features/listings/api/queries';
import type { Listing } from '@/features/listings';
import { seedQueryError } from '@/features/messages/pages/page-story-utils';
import { resetAssistant } from '@/lib/ai';
import { AssistantPanel } from './AssistantPanel';
import { AI_QUEUE_QUERY } from './assistant-context';

/** Pending queue with a mix of AI verdicts — only the OK rows are approvable. */
const QUEUE: Listing[] = [
  {
    id: 'L-1000', title: 'Kadıköy 3+1 daire', description: '—', category: 'konut', status: 'pending',
    price: 4_250_000, il: '34', ilce: 'kadikoy', mahalle: 'Moda',
    attributes: { grossArea: 120 }, agentName: 'Ofis 1', aiSuggestion: 'ok', aiReasons: ['Kurallara uygun'],
    createdAt: '2026-06-02T00:00:00.000Z',
  },
  {
    id: 'L-1001', title: 'Çankaya arsa', description: '—', category: 'arsa', status: 'pending',
    price: 2_100_000, il: '06', ilce: 'cankaya', mahalle: 'Kızılay',
    attributes: { grossArea: 500 }, agentName: 'Ofis 2', aiSuggestion: 'ok', aiReasons: ['Kurallara uygun'],
    createdAt: '2026-06-03T00:00:00.000Z',
  },
  {
    id: 'L-1002', title: 'Şüpheli ilan', description: '—', category: 'konut', status: 'pending',
    price: 999_999, il: '34', ilce: 'besiktas', mahalle: 'Levent',
    attributes: { grossArea: 90 }, agentName: 'Ofis 3', aiSuggestion: 'nok', aiReasons: ['Eksik tapu'],
    createdAt: '2026-06-04T00:00:00.000Z',
  },
];

function makeClient(seed: (qc: QueryClient) => void): QueryClient {
  const qc = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false, refetchOnMount: false, retryOnMount: false } },
  });
  seed(qc);
  return qc;
}

function renderPanel(seed: (qc: QueryClient) => void): ReactElement {
  const client = makeClient(seed);
  const router = createMemoryRouter(
    [
      {
        path: '/listings',
        element: (
          <div className="mx-auto max-w-md p-4">
            <AssistantPanel />
          </div>
        ),
        handle: { routeMeta: { title: 'İlanlar', permission: 'listing.view', aiEntity: 'listing' } },
      },
      { path: '*', element: <div /> },
    ],
    { initialEntries: ['/listings'] },
  );
  return (
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

const seedQueue = (items: Listing[]) => (qc: QueryClient) =>
  qc.setQueryData(listingKeys.list(AI_QUEUE_QUERY), {
    items,
    total: items.length,
    page: 1,
    pageSize: 50,
  });

const meta = {
  title: 'AI/AssistantPanel',
  parameters: { layout: 'fullscreen' },
  beforeEach: () => {
    resetAssistant();
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => renderPanel(seedQueue(QUEUE)),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Context header reflects the current route.
    await expect(canvas.getByText('İlanlar')).toBeInTheDocument();
    // The moderation copilot sees the 2 AI-OK pending rows (NOK excluded).
    await expect(canvas.getByText(/2/)).toBeInTheDocument();
    await expect(canvas.getByText('Toplu onayı öner')).toBeInTheDocument();

    // Parse an NL command → a filter intent card is proposed (confirm-before-apply).
    await userEvent.type(canvas.getByLabelText('Komut'), "İstanbul'da bekleyen arsa");
    await userEvent.click(canvas.getByRole('button', { name: /Yorumla/ }));
    await expect(canvas.getByText('Önerilen filtre')).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: /Uygula/ })).toBeInTheDocument();
  },
};

export const NavigateIntent: Story = {
  render: () => renderPanel(seedQueue(QUEUE)),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('Komut'), 'kullanıcılara git');
    await userEvent.click(canvas.getByRole('button', { name: /Yorumla/ }));
    await expect(canvas.getByText('Sayfaya git')).toBeInTheDocument();
  },
};

export const Loading: Story = {
  render: () => renderPanel(() => {}),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Moderasyon kopilotu')).toBeInTheDocument();
  },
};

export const Empty: Story = {
  render: () => renderPanel(seedQueue([])),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Onay bekleyen AI-OK ilan yok.')).toBeInTheDocument();
  },
};

export const Error: Story = {
  render: () => renderPanel((qc) => seedQueryError(qc, listingKeys.list(AI_QUEUE_QUERY))),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Kuyruk alınamadı')).toBeInTheDocument();
  },
};

export const Mobile: Story = {
  render: () => renderPanel(seedQueue(QUEUE)),
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
