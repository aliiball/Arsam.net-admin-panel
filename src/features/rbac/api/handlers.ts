import { http, HttpResponse } from 'msw';

import { API_BASE_URL } from '@/lib/api/client';
import { writeAudit } from '@/lib/audit';
import { matrix as seedMatrix, ROLES, type PermissionMatrix } from '@/lib/permissions/permissions';
import { cloneMatrix } from '@/lib/permissions/permission-store';
import { PERMISSION_CATALOG } from '../data/rbac';
import {
  isGranted,
  permissionToggleSchema,
  SUPER_ADMIN,
  toggleMatrix,
  type RbacMatrixEnvelope,
} from '../schemas/rbac';

// ---------------------------------------------------------------------------
// Runtime state — a live copy of the seed matrix (the "server" source of truth).
// ---------------------------------------------------------------------------

let rbacDb: PermissionMatrix = cloneMatrix(seedMatrix);

/** Reset the mock matrix DB (tests). */
export function resetRbacDb(): void {
  rbacDb = cloneMatrix(seedMatrix);
}

/** Read-only snapshot of the current server matrix. */
export function getRbacMatrixSnapshot(): PermissionMatrix {
  return cloneMatrix(rbacDb);
}

function envelope(): RbacMatrixEnvelope {
  return { roles: ROLES, catalog: PERMISSION_CATALOG, matrix: cloneMatrix(rbacDb) };
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

export const rbacHandlers = [
  http.get(`${API_BASE_URL}/rbac/matrix`, () => HttpResponse.json(envelope())),

  http.post(`${API_BASE_URL}/rbac/matrix/toggle`, async ({ request }) => {
    const parsed = permissionToggleSchema.safeParse(await request.json());
    if (!parsed.success) {
      return HttpResponse.json({ error: parsed.error.issues[0]?.message ?? 'Geçersiz istek' }, { status: 422 });
    }
    const { role, permission, granted } = parsed.data;

    // Guardrail: super-admin ('*') can never be downgraded — self-lockout guard.
    if (role === SUPER_ADMIN) {
      return HttpResponse.json(
        { error: 'Süper Admin izinleri değiştirilemez.' },
        { status: 422 },
      );
    }

    const wasGranted = isGranted(rbacDb, role, permission);
    rbacDb = toggleMatrix(rbacDb, role, permission, granted);

    // Only audit an actual change (idempotent toggles are no-ops).
    if (wasGranted !== granted) {
      writeAudit({
        actor: 'user:current',
        action: granted ? 'rbac.grant' : 'rbac.revoke',
        resource: `role:${role}`,
        before: { [permission]: wasGranted ? 'açık' : 'kapalı' },
        after: { [permission]: granted ? 'açık' : 'kapalı' },
      });
    }

    return HttpResponse.json(envelope());
  }),
];
