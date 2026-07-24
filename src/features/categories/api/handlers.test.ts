import { beforeEach, describe, expect, it } from 'vitest';

import { api } from '@/lib/api/client';
import { getAuditFor } from '@/lib/audit';
import { getCategoriesSnapshot, resetCategoriesDb } from './handlers';
import {
  nextOrder,
  sortByOrder,
  validateAttributeKeyUnique,
  type Category,
} from '../schemas/category';

beforeEach(() => resetCategoriesDb());

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

  it('validateAttributeKeyUnique ignores the field being edited', () => {
    const existing = [
      { id: 'a1', key: 'grossArea' },
      { id: 'a2', key: 'rooms' },
    ];
    expect(validateAttributeKeyUnique('netArea', existing)).toBe(true);
    expect(validateAttributeKeyUnique('rooms', existing)).toBe(false);
    // Same key on the field being edited is allowed.
    expect(validateAttributeKeyUnique('rooms', existing, 'a2')).toBe(true);
  });
});

describe('categories handlers', () => {
  it('returns the paginated envelope sorted by order and filters by status', async () => {
    const res = await api.list<Category>('categories', { page: 1, pageSize: 25, filters: {} });
    expect(res.total).toBeGreaterThan(0);
    const orders = res.items.map((c) => c.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));

    const archived = await api.list<Category>('categories', {
      page: 1,
      pageSize: 25,
      filters: { status: 'active' },
    });
    expect(archived.items.every((c) => c.status === 'active')).toBe(true);
  });

  it('returns a single category with its attributes', async () => {
    const cat = await api.get<Category>('/categories/C-100');
    expect(cat.key).toBe('konut');
    expect(cat.attributes.length).toBeGreaterThan(0);
  });

  it('creates a category and writes a category.create audit entry', async () => {
    const created = await api.post<Category>('/categories', {
      key: 'ofis',
      label: 'Ofis',
      description: 'Test',
      status: 'active',
    });
    expect(created.key).toBe('ofis');
    expect(getAuditFor(`category:${created.id}`)[0]?.action).toBe('category.create');
  });

  it('rejects duplicate keys with 422', async () => {
    await expect(
      api.post<Category>('/categories', { key: 'konut', label: 'Dup', description: '', status: 'active' }),
    ).rejects.toMatchObject({ status: 422 });
  });

  it('archiving via patch writes a category.archive audit entry', async () => {
    await api.patch<Category>('/categories/C-100', {
      key: 'konut',
      label: 'Konut',
      description: 'x',
      status: 'archived',
    });
    expect(getAuditFor('category:C-100')[0]?.action).toBe('category.archive');
  });

  it('reorder updates order and writes category.reorder', async () => {
    const before = getCategoriesSnapshot();
    const reversed = [...before].reverse().map((c) => c.id);
    const res = await api.post<Category[]>('/categories/reorder', { order: reversed });
    expect(res[0]?.id).toBe(reversed[0]);
    expect(res[0]?.order).toBe(0);
    expect(getAuditFor('category:*')[0]?.action).toBe('category.reorder');
  });

  it('upserts an attribute (create then update) and writes audit', async () => {
    const created = await api.post<Category>('/categories/C-101/attributes', {
      key: 'frontage',
      label: 'Cephe',
      type: 'number',
      required: false,
      unit: 'm',
    });
    const added = created.attributes.find((a) => a.key === 'frontage');
    expect(added).toBeDefined();
    expect(getAuditFor('category:C-101').some((e) => e.action === 'attribute.create')).toBe(true);

    const updated = await api.post<Category>('/categories/C-101/attributes', {
      id: added!.id,
      key: 'frontage',
      label: 'Cephe (güncel)',
      type: 'number',
      required: true,
    });
    expect(updated.attributes.find((a) => a.id === added!.id)?.required).toBe(true);
    expect(getAuditFor('category:C-101').some((e) => e.action === 'attribute.update')).toBe(true);
  });

  it('deletes an attribute and writes attribute.delete', async () => {
    const cat = await api.get<Category>('/categories/C-100');
    const target = cat.attributes[0]!;
    const after = await api.delete<Category>(`/categories/C-100/attributes/${target.id}`);
    expect(after.attributes.some((a) => a.id === target.id)).toBe(false);
    expect(getAuditFor('category:C-100').some((e) => e.action === 'attribute.delete')).toBe(true);
  });

  it('attribute reorder updates attribute order', async () => {
    const cat = await api.get<Category>('/categories/C-100');
    const ids = cat.attributes.map((a) => a.id);
    const reversed = [...ids].reverse();
    const after = await api.post<Category>('/categories/C-100/attributes/reorder', { order: reversed });
    expect(after.attributes[0]?.id).toBe(reversed[0]);
  });

  it('getCategoriesSnapshot exposes sorted taxonomy for the listing form bridge', () => {
    const snap = getCategoriesSnapshot();
    expect(snap.length).toBeGreaterThan(0);
    expect(snap.map((c) => c.order)).toEqual([...snap.map((c) => c.order)].sort((a, b) => a - b));
  });
});
