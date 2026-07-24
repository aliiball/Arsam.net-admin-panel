import { act, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import { RouteGuard } from '@/components/shell/RouteGuard';
import { Can, SessionProvider } from './permission-context';
import { matrix, type Permission } from './permissions';
import {
  cloneMatrix,
  getPermissionMatrix,
  resetPermissionMatrix,
  setPermissionMatrix,
} from './permission-store';

// The store is global mutable state — reset after every test so other suites
// (RouteGuard, nav) see the seed matrix.
afterEach(() => resetPermissionMatrix());

describe('permission store bridge', () => {
  it('reflects a live matrix edit in <Can> (nav/RouteGuard share this path)', () => {
    render(
      <SessionProvider initialUser={{ role: 'analyst' }}>
        <Can permission="listing.approve">
          <span>İZİN VAR</span>
        </Can>
      </SessionProvider>,
    );

    // analyst lacks listing.approve in the seed → hidden.
    expect(screen.queryByText('İZİN VAR')).not.toBeInTheDocument();

    // Grant it live via the store — <Can> must re-render and reveal the child.
    const granted = cloneMatrix(matrix);
    granted.analyst = [...(granted.analyst as Permission[]), 'listing.approve'];
    act(() => setPermissionMatrix(granted));

    expect(screen.getByText('İZİN VAR')).toBeInTheDocument();
  });

  it('reflects a live matrix edit in RouteGuard (route-level RBAC)', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          handle: { routeMeta: { title: 'RBAC', permission: 'rbac.manage' } },
          element: (
            <SessionProvider initialUser={{ role: 'analyst' }}>
              <RouteGuard>
                <div>GİZLİ İÇERİK</div>
              </RouteGuard>
            </SessionProvider>
          ),
        },
      ],
      { initialEntries: ['/'] },
    );
    render(<RouterProvider router={router} />);

    // analyst lacks rbac.manage → 403.
    expect(screen.getByText(/403/)).toBeInTheDocument();
    expect(screen.queryByText('GİZLİ İÇERİK')).not.toBeInTheDocument();

    // Grant rbac.manage live → the guard must re-open the route.
    const granted = cloneMatrix(matrix);
    granted.analyst = [...(granted.analyst as Permission[]), 'rbac.manage'];
    act(() => setPermissionMatrix(granted));

    expect(screen.getByText('GİZLİ İÇERİK')).toBeInTheDocument();
  });

  it('resetPermissionMatrix restores the seed', () => {
    const granted = cloneMatrix(matrix);
    granted.analyst = [...(granted.analyst as Permission[]), 'payment.refund'];
    setPermissionMatrix(granted);
    expect((getPermissionMatrix().analyst as Permission[]).includes('payment.refund')).toBe(true);

    resetPermissionMatrix();
    expect((getPermissionMatrix().analyst as Permission[]).includes('payment.refund')).toBe(false);
  });
});
