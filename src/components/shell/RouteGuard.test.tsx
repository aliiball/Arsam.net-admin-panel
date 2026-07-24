import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { RouteGuard } from './RouteGuard';
import { SessionProvider } from '@/lib/permissions/permission-context';
import type { Role } from '@/lib/permissions/permissions';

function renderGuarded(role: Role) {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        handle: { routeMeta: { title: 'RBAC', permission: 'rbac.manage' } },
        element: (
          <SessionProvider initialUser={{ role }}>
            <RouteGuard>
              <div>GİZLİ İÇERİK</div>
            </RouteGuard>
          </SessionProvider>
        ),
      },
    ],
    { initialEntries: ['/'] },
  );
  return render(<RouterProvider router={router} />);
}

describe('RouteGuard (route-level RBAC)', () => {
  it('blocks a role lacking the route permission with a 403', () => {
    renderGuarded('analyst');
    expect(screen.getByText(/403/)).toBeInTheDocument();
    expect(screen.queryByText('GİZLİ İÇERİK')).not.toBeInTheDocument();
  });

  it('allows a role holding the permission (super-admin: *)', () => {
    renderGuarded('super-admin');
    expect(screen.getByText('GİZLİ İÇERİK')).toBeInTheDocument();
  });
});
