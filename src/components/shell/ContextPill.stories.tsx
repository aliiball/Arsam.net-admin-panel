import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router-dom';
import { expect, within } from 'storybook/test';

import { ContextPill } from './ContextPill';
import { shellRouterDecorator } from './story-helpers';

const FIXED_NOW = new Date('2026-07-25T09:07:00');

const meta = {
  title: 'Shell/ContextPill',
  component: ContextPill,
  parameters: { layout: 'centered' },
  args: { now: FIXED_NOW },
} satisfies Meta<typeof ContextPill>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Top-level route — only the current page + clock. */
export const Default: Story = {
  decorators: [shellRouterDecorator({ title: 'Genel Bakış' })],
  play: async () => {
    await expect(within(document.body).getByText('Genel Bakış')).toBeInTheDocument();
    await expect(within(document.body).getByText('09:07')).toBeInTheDocument();
  },
};

/** Nested route — the parent renders as an "up a level" link (md+). */
export const Nested: Story = {
  parameters: { viewport: { defaultViewport: 'bpXl' } },
  decorators: [
    (Story) => {
      const router = createMemoryRouter(
        [
          {
            path: '/listings',
            element: <Outlet />,
            handle: { routeMeta: { title: 'İlanlar' } },
            children: [
              {
                path: 'moderation',
                element: (<Story />) as ReactElement,
                handle: { routeMeta: { title: 'Moderasyon Kuyruğu' } },
              },
            ],
          },
        ],
        { initialEntries: ['/listings/moderation'] },
      );
      return <RouterProvider router={router} />;
    },
  ],
  play: async () => {
    await expect(within(document.body).getByText('Moderasyon Kuyruğu')).toBeInTheDocument();
    // Parent link is present in the DOM (revealed at 2xl+).
    await expect(within(document.body).getByRole('link', { name: 'İlanlar' })).toBeInTheDocument();
  },
};

export const Mobile: Story = {
  decorators: [shellRouterDecorator({ title: 'Genel Bakış' })],
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
