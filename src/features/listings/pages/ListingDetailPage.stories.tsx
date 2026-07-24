import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { DEFAULT_FLAGS } from '@/lib/settings/feature-flags';
import { resetFeatureFlags, setFeatureFlags } from '@/lib/settings/feature-flags-store';
import { ListingDetailPage } from './ListingDetailPage';
import { listingKeys } from '../api/queries';
import { MOCK_LISTINGS, renderPage } from './page-story-utils';

function render(seed: 'ok' | 'empty' = 'ok') {
  return renderPage(<ListingDetailPage />, {
    path: '/listings/:id',
    initialPath: '/listings/L-1000',
    extraRoutes: [{ path: '*', element: <div /> }],
    seed: (qc) => {
      if (seed === 'ok') qc.setQueryData(listingKeys.detail('L-1000'), MOCK_LISTINGS[0]);
    },
  });
}

const meta = {
  title: 'Listings/Pages/Detail',
  parameters: { layout: 'fullscreen' },
  render: () => render('ok'),
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('İstanbul konut ilanı 1')).toBeInTheDocument();
    await expect(canvas.getByRole('group', { name: 'Moderasyon kararı' })).toBeInTheDocument();
    // With flags enabled (default), the AI badge + map card render.
    await expect(canvas.getByText('AI: Belirsiz')).toBeInTheDocument();
    await expect(canvas.getByText('Konum')).toBeInTheDocument();
  },
};

/**
 * Feature-flag live binding: turning `listingDetailMap` + `aiCopilotBadges` off
 * (as the settings screen does) removes the map card and the AI badge. Resets on
 * cleanup so sibling stories see the default (enabled) flags.
 */
export const FlagsOff: Story = {
  // Mutates the global flag singleton; safe because Vitest isolates test files
  // and browser-mode stories run sequentially. The cleanup resets defaults so
  // sibling stories (Default) still see the flags enabled.
  beforeEach: () => {
    setFeatureFlags({ ...DEFAULT_FLAGS, listingDetailMap: false, aiCopilotBadges: false });
    return () => resetFeatureFlags();
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('İstanbul konut ilanı 1')).toBeInTheDocument();
    await expect(canvas.queryByText('AI: Belirsiz')).not.toBeInTheDocument();
    await expect(canvas.queryByText('Konum')).not.toBeInTheDocument();
  },
};

export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
export const Loading: Story = { render: () => render('empty') };
export const Empty: Story = { render: () => render('empty') };
export const Error: Story = { render: () => render('empty') };
