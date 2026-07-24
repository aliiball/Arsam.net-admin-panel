import type { ReactElement } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import type { Decorator } from '@storybook/react-vite';

import type { RouteMeta } from '@/app/route-meta';
import { CommandPaletteProvider } from './command-palette-context';

/**
 * Wrap a story in a data-mode memory router so shell components that use
 * `useMatches` / `NavLink` / `useNavigate` work. A catch-all route keeps the
 * story mounted across in-story navigation.
 */
export function shellRouterDecorator(routeMeta: RouteMeta = { title: 'Genel Bakış' }): Decorator {
  return (Story) => {
    const router = createMemoryRouter(
      [{ path: '*', element: <Story /> as ReactElement, handle: { routeMeta } }],
      { initialEntries: ['/'] },
    );
    return <RouterProvider router={router} />;
  };
}

/** Provides command-palette state for stories using Topbar / search / palette. */
export const commandPaletteDecorator: Decorator = (Story) => (
  <CommandPaletteProvider>
    <Story />
  </CommandPaletteProvider>
);
