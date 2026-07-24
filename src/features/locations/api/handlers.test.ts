import { beforeEach, describe, expect, it } from 'vitest';

import { api } from '@/lib/api/client';
import { getAuditFor } from '@/lib/audit';
import { getLocationsSnapshot, resetLocationsDb } from './handlers';
import {
  nextOrder,
  sortByOrder,
  validateCodeUnique,
  validateKeyUnique,
  type Province,
} from '../schemas/location';

beforeEach(() => resetLocationsDb());

describe('pure helpers', () => {
  it('sortByOrder returns ascending order without mutating input', () => {
    const input = [{ order: 2 }, { order: 0 }, { order: 1 }];
    const sorted = sortByOrder(input);
    expect(sorted.map((i) => i.order)).toEqual([0, 1, 2]);
    expect(input.map((i) => i.order)).toEqual([2, 0, 1]);
  });

  it('nextOrder is max+1, or 0 when empty', () => {
    expect(nextOrder([])).toBe(0);
    expect(nextOrder([{ order: 0 }, { order: 3 }, { order: 1 }])).toBe(4);
  });

  it('validateCodeUnique ignores the province being edited', () => {
    const existing = [
      { id: 'p1', code: '34' },
      { id: 'p2', code: '06' },
    ];
    expect(validateCodeUnique('35', existing)).toBe(true);
    expect(validateCodeUnique('06', existing)).toBe(false);
    expect(validateCodeUnique('06', existing, 'p2')).toBe(true);
  });

  it('validateKeyUnique ignores the district being edited (case-insensitive)', () => {
    const existing = [
      { id: 'd1', key: 'kadikoy' },
      { id: 'd2', key: 'besiktas' },
    ];
    expect(validateKeyUnique('uskudar', existing)).toBe(true);
    expect(validateKeyUnique('Besiktas', existing)).toBe(false);
    expect(validateKeyUnique('besiktas', existing, 'd2')).toBe(true);
  });
});

describe('locations handlers', () => {
  it('returns the paginated envelope sorted by order and filters by status', async () => {
    const res = await api.list<Province>('provinces', { page: 1, pageSize: 25, filters: {} });
    expect(res.total).toBeGreaterThan(0);
    const orders = res.items.map((p) => p.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));

    const active = await api.list<Province>('provinces', {
      page: 1,
      pageSize: 25,
      filters: { status: 'active' },
    });
    expect(active.items.every((p) => p.status === 'active')).toBe(true);
  });

  it('returns a single province with its districts and neighborhoods', async () => {
    const p = await api.get<Province>('/provinces/P-34');
    expect(p.label).toBe('İstanbul');
    expect(p.districts.length).toBeGreaterThan(0);
    expect(p.districts[0]?.neighborhoods.length).toBeGreaterThan(0);
  });

  it('creates a province and writes a location.create audit entry', async () => {
    const created = await api.post<Province>('/provinces', { code: '16', label: 'Bursa', status: 'active' });
    expect(created.code).toBe('16');
    expect(getAuditFor(`province:${created.id}`)[0]?.action).toBe('location.create');
  });

  it('rejects duplicate plate codes with 422', async () => {
    await expect(
      api.post<Province>('/provinces', { code: '34', label: 'Dup', status: 'active' }),
    ).rejects.toMatchObject({ status: 422 });
  });

  it('rejects invalid plate codes with 422', async () => {
    await expect(
      api.post<Province>('/provinces', { code: '3', label: 'Bad', status: 'active' }),
    ).rejects.toMatchObject({ status: 422 });
  });

  it('archiving a province via patch writes a location.archive audit entry', async () => {
    await api.patch<Province>('/provinces/P-34', { code: '34', label: 'İstanbul', status: 'archived' });
    expect(getAuditFor('province:P-34')[0]?.action).toBe('location.archive');
  });

  it('reorder updates province order and writes location.reorder', async () => {
    const before = getLocationsSnapshot();
    const reversed = [...before].reverse().map((p) => p.id);
    const res = await api.post<Province[]>('/provinces/reorder', { order: reversed });
    expect(res[0]?.id).toBe(reversed[0]);
    expect(res[0]?.order).toBe(0);
    expect(getAuditFor('province:*')[0]?.action).toBe('location.reorder');
  });

  it('upserts a district (create then update) and writes audit', async () => {
    const created = await api.post<Province>('/provinces/P-34/districts', {
      key: 'uskudar',
      label: 'Üsküdar',
      status: 'active',
    });
    const added = created.districts.find((d) => d.key === 'uskudar');
    expect(added).toBeDefined();
    expect(getAuditFor('province:P-34').some((e) => e.action === 'location.create')).toBe(true);

    const updated = await api.post<Province>('/provinces/P-34/districts', {
      id: added!.id,
      key: 'uskudar',
      label: 'Üsküdar (güncel)',
      status: 'active',
    });
    expect(updated.districts.find((d) => d.id === added!.id)?.label).toBe('Üsküdar (güncel)');
    expect(getAuditFor('province:P-34').some((e) => e.action === 'location.update')).toBe(true);
  });

  it('rejects duplicate district keys within a province with 422', async () => {
    await expect(
      api.post<Province>('/provinces/P-34/districts', { key: 'kadikoy', label: 'Dup', status: 'active' }),
    ).rejects.toMatchObject({ status: 422 });
  });

  it('deletes a district and writes location.delete', async () => {
    const p = await api.get<Province>('/provinces/P-34');
    const target = p.districts[0]!;
    const after = await api.delete<Province>(`/provinces/P-34/districts/${target.id}`);
    expect(after.districts.some((d) => d.id === target.id)).toBe(false);
    expect(getAuditFor('province:P-34').some((e) => e.action === 'location.delete')).toBe(true);
  });

  it('reorders districts and updates order', async () => {
    const p = await api.get<Province>('/provinces/P-34');
    const ids = p.districts.map((d) => d.id);
    const reversed = [...ids].reverse();
    const after = await api.post<Province>('/provinces/P-34/districts/reorder', { order: reversed });
    expect(after.districts[0]?.id).toBe(reversed[0]);
    expect(getAuditFor('province:P-34').some((e) => e.action === 'location.reorder')).toBe(true);
  });

  it('upserts, reorders and deletes a neighborhood with audit', async () => {
    const p = await api.get<Province>('/provinces/P-34');
    const district = p.districts[0]!;

    const withNew = await api.post<Province>(`/provinces/P-34/districts/${district.id}/neighborhoods`, {
      name: 'Rasimpaşa',
    });
    const added = withNew.districts.find((d) => d.id === district.id)!.neighborhoods.find((n) => n.name === 'Rasimpaşa');
    expect(added).toBeDefined();
    expect(getAuditFor('province:P-34').some((e) => e.action === 'location.create')).toBe(true);

    const ids = withNew.districts.find((d) => d.id === district.id)!.neighborhoods.map((n) => n.id);
    const reversed = [...ids].reverse();
    const reordered = await api.post<Province>(
      `/provinces/P-34/districts/${district.id}/neighborhoods/reorder`,
      { order: reversed },
    );
    expect(reordered.districts.find((d) => d.id === district.id)!.neighborhoods[0]?.id).toBe(reversed[0]);

    const afterDelete = await api.delete<Province>(
      `/provinces/P-34/districts/${district.id}/neighborhoods/${added!.id}`,
    );
    const stillThere = afterDelete.districts
      .find((d) => d.id === district.id)!
      .neighborhoods.some((n) => n.id === added!.id);
    expect(stillThere).toBe(false);
  });

  it('getLocationsSnapshot exposes the sorted taxonomy for the listing form bridge', () => {
    const snap = getLocationsSnapshot();
    expect(snap.length).toBeGreaterThan(0);
    expect(snap.map((p) => p.order)).toEqual([...snap.map((p) => p.order)].sort((a, b) => a - b));
    // Children are sorted too.
    const withDistricts = snap.find((p) => p.districts.length > 1);
    if (withDistricts) {
      const orders = withDistricts.districts.map((d) => d.order);
      expect(orders).toEqual([...orders].sort((a, b) => a - b));
    }
  });
});
