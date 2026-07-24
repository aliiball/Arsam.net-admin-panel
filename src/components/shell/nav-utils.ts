import { useMemo } from 'react';

import { navSchema, type NavItem } from '@/config/nav-schema';
import { useSession } from '@/lib/permissions/permission-context';
import { can } from '@/lib/permissions/permissions';
import type { Role } from '@/lib/permissions/permissions';

/** Keep items the role may access; recurse into children. */
export function filterNavByRole(items: NavItem[], role: Role): NavItem[] {
  return items
    .filter((item) => !item.permission || can(role, item.permission))
    .map((item) =>
      item.children
        ? { ...item, children: filterNavByRole(item.children, role) }
        : item,
    );
}

/** The nav schema filtered to the current user's role (both shells + mobile). */
export function usePermittedNav(): NavItem[] {
  const { user } = useSession();
  return useMemo(() => filterNavByRole(navSchema, user.role), [user.role]);
}

/** Whether a nav item is active for the current pathname. */
export function isNavItemActive(to: string, pathname: string): boolean {
  if (to === '/') return pathname === '/';
  return pathname === to || pathname.startsWith(`${to}/`);
}

/** Primary items for the mobile bottom nav (<=5). */
export function usePrimaryNav(limit = 5): NavItem[] {
  const nav = usePermittedNav();
  return useMemo(() => nav.filter((i) => i.primary).slice(0, limit), [nav, limit]);
}
