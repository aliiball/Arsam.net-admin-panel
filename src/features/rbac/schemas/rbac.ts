import { z } from 'zod';

import {
  ROLES,
  type Permission,
  type PermissionMatrix,
  type Role,
} from '@/lib/permissions/permissions';
import type { CatalogGroup } from '../data/rbac';

// Re-export the canonical RBAC types (single origin — no competing definition).
export type { Permission, PermissionMatrix, Role };
export { ROLES };
export { PERMISSION_CATALOG, ALL_PERMISSIONS, type CatalogAction, type CatalogGroup } from '../data/rbac';

/** The role that can NEVER be edited: always holds every permission (`'*'`). */
export const SUPER_ADMIN: Role = 'super-admin';

/** Roles the editor may modify (super-admin is guarded out). */
export const EDITABLE_ROLES: Role[] = ROLES.filter((r) => r !== SUPER_ADMIN);

const roleEnum = z.enum(ROLES as [Role, ...Role[]]);

/** `resource.action` shape guard. */
const permissionSchema = z
  .string()
  .regex(/^[a-z-]+\.[a-z-]+$/, 'Geçersiz izin biçimi') as z.ZodType<Permission>;

/** Payload for a single matrix cell toggle. */
export const permissionToggleSchema = z.object({
  role: roleEnum,
  permission: permissionSchema,
  granted: z.boolean(),
});
export type PermissionToggleInput = z.infer<typeof permissionToggleSchema>;

/** Envelope returned by `GET /rbac/matrix`. */
export const rbacMatrixSchema = z.object({
  roles: z.array(roleEnum),
  matrix: z.record(roleEnum, z.union([z.literal('*'), z.array(permissionSchema)])),
});
export type RbacMatrixEnvelope = {
  roles: Role[];
  catalog: CatalogGroup[];
  matrix: PermissionMatrix;
};

/**
 * Whether `matrix[role]` grants `permission` (super-admin `'*'` always true).
 * Deterministic, pure — used by the editor + tests.
 */
export function isGranted(matrix: PermissionMatrix, role: Role, permission: Permission): boolean {
  const set = matrix[role];
  return set === '*' || set.includes(permission);
}

/**
 * Return a NEW matrix with `permission` toggled for `role`. Never mutates input;
 * super-admin is returned unchanged (guardrail — enforced again server-side).
 */
export function toggleMatrix(
  matrix: PermissionMatrix,
  role: Role,
  permission: Permission,
  granted: boolean,
): PermissionMatrix {
  if (role === SUPER_ADMIN) return matrix;
  const current = matrix[role];
  if (current === '*') return matrix;
  const has = current.includes(permission);
  let next = current;
  if (granted && !has) next = [...current, permission];
  else if (!granted && has) next = current.filter((p) => p !== permission);
  return { ...matrix, [role]: next };
}
