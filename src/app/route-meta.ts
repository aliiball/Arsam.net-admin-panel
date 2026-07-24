import type { Permission } from '@/lib/permissions/permissions';

/**
 * Metadata attached to every route via `handle.routeMeta`.
 * Consumed by guards (permission), breadcrumbs (title), and the AI layer (aiEntity).
 */
export interface RouteMeta {
  title: string;
  permission?: Permission;
  aiEntity?: string;
}

export interface RouteHandle {
  routeMeta: RouteMeta;
}

/** Type guard for reading `handle.routeMeta` off matched routes. */
export function hasRouteMeta(handle: unknown): handle is RouteHandle {
  return (
    typeof handle === 'object' &&
    handle !== null &&
    'routeMeta' in handle &&
    typeof (handle as RouteHandle).routeMeta?.title === 'string'
  );
}
