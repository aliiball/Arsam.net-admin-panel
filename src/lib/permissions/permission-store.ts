import * as React from 'react';

import {
  matrix as seedMatrix,
  canWith,
  type Permission,
  type PermissionMatrix,
  type Role,
} from './permissions';

/** Deep-clone a matrix so the runtime copy never aliases the seed constant. */
export function cloneMatrix(m: PermissionMatrix): PermissionMatrix {
  const out = {} as PermissionMatrix;
  for (const role of Object.keys(m) as Role[]) {
    const set = m[role];
    out[role] = set === '*' ? '*' : [...set];
  }
  return out;
}

/**
 * The LIVE permission matrix. Seeded from the immutable `matrix` constant, but
 * editable at runtime by the RBAC editor. `can`/`Can`/nav/RouteGuard read this
 * copy via `usePermissionMatrix`, so edits reflect everywhere immediately.
 */
let current: PermissionMatrix = cloneMatrix(seedMatrix);
const listeners = new Set<() => void>();

export function getPermissionMatrix(): PermissionMatrix {
  return current;
}

/** Replace the live matrix (always pass a NEW object) and notify subscribers. */
export function setPermissionMatrix(next: PermissionMatrix): void {
  current = next;
  listeners.forEach((listener) => listener());
}

/** Reset the live matrix back to the seed (tests, dev role switcher). */
export function resetPermissionMatrix(): void {
  setPermissionMatrix(cloneMatrix(seedMatrix));
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Subscribe a React tree to live matrix changes (re-renders on every edit). */
export function usePermissionMatrix(): PermissionMatrix {
  return React.useSyncExternalStore(subscribe, getPermissionMatrix, getPermissionMatrix);
}

/** Live permission check against the current (possibly edited) matrix. */
export function can(role: Role, permission: Permission): boolean {
  return canWith(current, role, permission);
}
