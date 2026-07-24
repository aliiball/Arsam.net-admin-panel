import { beforeEach, describe, expect, it } from 'vitest';

import { api, ApiError } from '@/lib/api/client';
import { getAuditFor } from '@/lib/audit';
import { isGranted, type RbacMatrixEnvelope } from '../schemas/rbac';
import { resetRbacDb } from './handlers';

beforeEach(() => resetRbacDb());

describe('rbac handlers', () => {
  it('returns the matrix + catalog envelope', async () => {
    const env = await api.get<RbacMatrixEnvelope>('/rbac/matrix');
    expect(env.roles).toContain('moderator');
    expect(env.matrix['super-admin']).toBe('*');
    expect(env.catalog.some((g) => g.resource === 'listing')).toBe(true);
    // moderator holds listing.approve in the seed.
    expect(isGranted(env.matrix, 'moderator', 'listing.approve')).toBe(true);
  });

  it('grants a permission and writes an rbac.grant audit entry', async () => {
    // moderator lacks user.view in the seed.
    const env = await api.post<RbacMatrixEnvelope>('/rbac/matrix/toggle', {
      role: 'moderator',
      permission: 'user.view',
      granted: true,
    });
    expect(isGranted(env.matrix, 'moderator', 'user.view')).toBe(true);
    const audit = getAuditFor('role:moderator');
    expect(audit[0]?.action).toBe('rbac.grant');
  });

  it('revokes a permission and writes an rbac.revoke audit entry', async () => {
    const env = await api.post<RbacMatrixEnvelope>('/rbac/matrix/toggle', {
      role: 'moderator',
      permission: 'listing.approve',
      granted: false,
    });
    expect(isGranted(env.matrix, 'moderator', 'listing.approve')).toBe(false);
    expect(getAuditFor('role:moderator')[0]?.action).toBe('rbac.revoke');
  });

  it('guards super-admin: cannot be downgraded (422)', async () => {
    const err = await api
      .post<RbacMatrixEnvelope>('/rbac/matrix/toggle', {
        role: 'super-admin',
        permission: 'listing.approve',
        granted: false,
      })
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(422);
    // super-admin still holds everything.
    const env = await api.get<RbacMatrixEnvelope>('/rbac/matrix');
    expect(env.matrix['super-admin']).toBe('*');
  });

  it('rejects an invalid toggle payload (422)', async () => {
    const err = await api
      .post<RbacMatrixEnvelope>('/rbac/matrix/toggle', { role: 'moderator', permission: 'nope', granted: true })
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(422);
  });

  it('idempotent toggle writes no new audit entry', async () => {
    // The audit log is global append-only state; measure the delta, not the total.
    const before = getAuditFor('role:moderator').length;
    // moderator already has listing.approve in the seed; granting again is a no-op.
    await api.post<RbacMatrixEnvelope>('/rbac/matrix/toggle', {
      role: 'moderator',
      permission: 'listing.approve',
      granted: true,
    });
    expect(getAuditFor('role:moderator').length).toBe(before);
  });
});
