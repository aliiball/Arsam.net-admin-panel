# Permissions (RBAC)

## Roles
`super-admin`, `moderator`, `support`, `finance`, `analyst`. Roles map to permission sets; a user has exactly one primary role (extendable to multiple later).

## Permission naming: `resource.action`
Examples: `listing.view`, `listing.approve`, `listing.reject`, `listing.edit`, `user.view`, `user.verify`, `user.suspend`, `user.ban`, `user.unban`, `agent.verify`, `category.manage`, `location.manage`, `promotion.sell`, `payment.refund`, `message.moderate`, `report.view`, `audit.view`, `rbac.manage`, `settings.manage`.

## PermissionMatrix data model
```ts
export type Role = 'super-admin' | 'moderator' | 'support' | 'finance' | 'analyst';
export type Permission = `${string}.${string}`;
export type PermissionMatrix = Record<Role, Permission[] | '*'>;
export const matrix: PermissionMatrix = {
  'super-admin': '*',
  moderator: ['listing.view','listing.approve','listing.reject','listing.edit','message.moderate','report.view'],
  support:   ['user.view','user.verify','user.suspend','user.ban','user.unban','agent.verify','message.moderate','listing.view'],
  finance:   ['promotion.sell','payment.refund','report.view','listing.view'],
  analyst:   ['report.view','listing.view','audit.view'],
};
export function canWith(m: PermissionMatrix, role: Role, p: Permission): boolean {
  const set = m[role];
  return set === '*' || set.includes(p);
}
```

The `matrix` constant is the immutable **seed**. At runtime the matrix is editable via
the RBAC editor (`/rbac`); the live copy lives in `lib/permissions/permission-store`
(`getPermissionMatrix`/`setPermissionMatrix`, `usePermissionMatrix` React subscription).
`Can`/`usePermission`/nav filtering/`RouteGuard` all read the LIVE copy, so an edit made
on `/rbac` reflects everywhere immediately. Every grant/revoke writes an audit entry
(`rbac.grant`/`rbac.revoke`, resource `role:<role>`).

## Editable-model guardrails
- **`super-admin` is immutable**: always `'*'` (every permission). The editor renders it
  read-only and the toggle endpoint returns 422 if a downgrade is attempted (self-lockout guard).
- The full grantable set is catalogued in `features/rbac/data/rbac.ts` (`PERMISSION_CATALOG`,
  grouped by resource) — keep it in sync with the seed `matrix` and this file.

## UI gating rules (hide vs disable)
- **Hide** when the user could never have the permission in their role (avoid teasing capabilities).
- **Disable** (with tooltip explaining why) when the action is contextually unavailable but within the role (e.g., already-approved listing).
- Use a `<Can permission="listing.approve">` wrapper + `usePermission()` hook.

## Route guards
Each route's `handle.routeMeta.permission` is checked in a guard; failure -> redirect to 403. Guards run in loaders where possible so unauthorized data never loads.

## Relationship to audit log
Every permissioned mutation writes an audit entry `{ actor, action, resource, before, after, ts }`. AI-initiated actions record `actor: 'ai:<agent>'` and always require human confirmation before persisting.
