import { ROLES, matrix } from '@/lib/permissions/permissions';
import { cloneMatrix } from '@/lib/permissions/permission-store';
import { PERMISSION_CATALOG } from '../data/rbac';
import type { RbacMatrixEnvelope } from '../schemas/rbac';

// Reuse the seeded-client + memory-router harness (+ real-error seeder).
export { renderPage, makeSeededClient } from '@/features/listings/pages/page-story-utils';
export { seedQueryError } from '@/features/messages/pages/page-story-utils';

/** Deterministic matrix envelope for stories (a clone of the seed matrix). */
export const MOCK_ENVELOPE: RbacMatrixEnvelope = {
  roles: ROLES,
  catalog: PERMISSION_CATALOG,
  matrix: cloneMatrix(matrix),
};
