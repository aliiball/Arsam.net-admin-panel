import type { ParseContext, ModuleItem } from '@/lib/ai';
import { flattenNav, navSchema, type NavItem } from '@/config/nav-schema';
import type { Permission } from '@/lib/permissions/permissions';
import type { PermissionMatrix, Role } from '@/lib/permissions/permissions';
import type { TableQuery } from '@/components/data-table/types';
import { filterNavByRole } from '@/components/shell/nav-utils';
import { listingFilterContext } from '@/features/listings/lib/nl-context';

/**
 * The pending queue the bulk-approve copilot reads. Module-constant so the
 * query identity stays stable; lives here (not in the component file) so
 * stories can seed the exact key without tripping react-refresh.
 */
export const AI_QUEUE_QUERY: TableQuery = {
  page: 1,
  pageSize: 50,
  sort: [{ id: 'createdAt', desc: false }],
  filters: { status: 'pending' },
  q: '',
};

/**
 * Build the parser vocabulary for the global assistant from the user's PERMITTED
 * navigation (so a proposed navigate never points at a route the role can't open)
 * plus the listing filter taxonomy. Single origin: reuses `listingFilterContext`.
 */
export function buildAssistantContext(
  role: Role,
  matrix: PermissionMatrix,
  entity?: string,
): ParseContext {
  const permitted = flattenNav(filterNavByRole(navSchema, role, matrix));
  const modules: ModuleItem[] = permitted.map((n: NavItem) =>
    n.aiEntity ? { to: n.to, label: n.label, entity: n.aiEntity } : { to: n.to, label: n.label },
  );

  // Map each entity to its list route (first match wins) for filter targeting.
  const routes: Record<string, string> = {};
  for (const m of modules) {
    if (m.entity && !(m.entity in routes)) routes[m.entity] = m.to;
  }

  const listing = listingFilterContext();
  return {
    ...listing,
    ...(entity ? { entity } : {}),
    routes: { ...routes, ...listing.routes },
    modules,
  };
}

/** Whether the acting role may run the AI bulk-approve copilot. */
export const AI_APPROVE_PERMISSION: Permission = 'listing.approve';
