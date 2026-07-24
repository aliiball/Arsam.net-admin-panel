import type { ReactNode } from 'react';
import { useMatches } from 'react-router-dom';

import { hasRouteMeta } from '@/app/route-meta';
import { ForbiddenPage } from '@/app/pages/ForbiddenPage';
import { useSession } from '@/lib/permissions/permission-context';
import { can } from '@/lib/permissions/permissions';

/**
 * Route-level RBAC guard. Reads every matched route's `handle.routeMeta.permission`
 * and renders a 403 when the current role lacks any of them — so deep-links and
 * direct URL entry are protected, not just the nav. (Nav filtering hides links.)
 */
export function RouteGuard({ children }: { children: ReactNode }) {
  const matches = useMatches();
  const { user } = useSession();

  const denied = matches.some((m) => {
    if (!hasRouteMeta(m.handle)) return false;
    const permission = m.handle.routeMeta.permission;
    return permission ? !can(user.role, permission) : false;
  });

  return <>{denied ? <ForbiddenPage /> : children}</>;
}
