# Permissions (RBAC)

## Roles
`super-admin`, `moderator`, `support`, `finance`, `analyst`. Roles map to permission sets; a user has exactly one primary role (extendable to multiple later).

## Permission naming: `resource.action`
Examples: `listing.view`, `listing.approve`, `listing.reject`, `listing.edit`, `user.view`, `user.ban`, `user.verify`, `agent.verify`, `category.manage`, `location.manage`, `promotion.sell`, `payment.refund`, `message.moderate`, `report.view`, `audit.view`, `rbac.manage`, `settings.manage`.

## PermissionMatrix data model
```ts
export type Role = 'super-admin' | 'moderator' | 'support' | 'finance' | 'analyst';
export type Permission = `${string}.${string}`;
export type PermissionMatrix = Record<Role, Permission[] | '*'>;
export const matrix: PermissionMatrix = {
  'super-admin': '*',
  moderator: ['listing.view','listing.approve','listing.reject','listing.edit','message.moderate','report.view'],
  support:   ['user.view','user.verify','agent.verify','message.moderate','listing.view'],
  finance:   ['promotion.sell','payment.refund','report.view','listing.view'],
  analyst:   ['report.view','listing.view','audit.view'],
};
export function can(role: Role, p: Permission): boolean {
  const set = matrix[role];
  return set === '*' || set.includes(p);
}
```

## UI gating rules (hide vs disable)
- **Hide** when the user could never have the permission in their role (avoid teasing capabilities).
- **Disable** (with tooltip explaining why) when the action is contextually unavailable but within the role (e.g., already-approved listing).
- Use a `<Can permission="listing.approve">` wrapper + `usePermission()` hook.

## Route guards
Each route's `handle.routeMeta.permission` is checked in a guard; failure -> redirect to 403. Guards run in loaders where possible so unauthorized data never loads.

## Relationship to audit log
Every permissioned mutation writes an audit entry `{ actor, action, resource, before, after, ts }`. AI-initiated actions record `actor: 'ai:<agent>'` and always require human confirmation before persisting.
