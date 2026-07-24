import { http, HttpResponse } from 'msw';

import { API_BASE_URL } from '@/lib/api/client';
import type { Paginated } from '@/lib/api/types';
import { writeAudit } from '@/lib/audit';
import { buildSeedCategories } from '../data/categories';
import {
  attributeFormSchema,
  categoryFormSchema,
  reorderInputSchema,
  sortByOrder,
  type AttributeField,
  type Category,
} from '../schemas/category';

function seed(): Category[] {
  return buildSeedCategories().map((c, ci) => ({
    id: `C-${100 + ci}`,
    key: c.key,
    label: c.label,
    description: c.description,
    icon: c.icon,
    order: ci,
    status: 'active' as const,
    attributes: c.attributes.map((a, ai) => ({
      id: `C-${100 + ci}-A-${ai}`,
      key: a.key,
      label: a.label,
      type: a.type,
      required: a.required,
      ...(a.unit ? { unit: a.unit } : {}),
      ...(a.options ? { options: a.options } : {}),
      order: ai,
    })),
  }));
}

let db: Category[] = seed();
let attrSeq = 0;

/** Reset the mock DB (tests). */
export function resetCategoriesDb() {
  db = seed();
  attrSeq = 0;
}

/** Current snapshot of the taxonomy (read bridge for the listing form). */
export function getCategoriesSnapshot(): Category[] {
  return sortByOrder(db).map((c) => ({ ...c, attributes: sortByOrder(c.attributes) }));
}

function applyQuery(url: URL): Paginated<Category> {
  const page = Number(url.searchParams.get('page') ?? '1');
  const pageSize = Number(url.searchParams.get('pageSize') ?? '25');
  const q = url.searchParams.get('q')?.toLocaleLowerCase('tr') ?? '';
  const statuses = url.searchParams.getAll('status');
  const sortRaw = url.searchParams.get('sort');

  let items = db.filter((c) => {
    if (q && !c.label.toLocaleLowerCase('tr').includes(q) && !c.key.toLocaleLowerCase('tr').includes(q)) return false;
    if (statuses.length && !statuses.includes(c.status)) return false;
    return true;
  });

  if (sortRaw) {
    const [field, dir] = sortRaw.split(',')[0]!.split(':');
    items = [...items].sort((a, b) => {
      const av = a[field as keyof Category] as string | number;
      const bv = b[field as keyof Category] as string | number;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return dir === 'desc' ? -cmp : cmp;
    });
  } else {
    items = sortByOrder(items);
  }

  const total = items.length;
  const start = (page - 1) * pageSize;
  const slice = items.slice(start, start + pageSize).map((c) => ({ ...c, attributes: sortByOrder(c.attributes) }));
  return { items: slice, total, page, pageSize };
}

export const categoriesHandlers = [
  http.get(`${API_BASE_URL}/categories`, ({ request }) => HttpResponse.json(applyQuery(new URL(request.url)))),

  http.get(`${API_BASE_URL}/categories/:id`, ({ params }) => {
    const cat = db.find((c) => c.id === params.id);
    return cat
      ? HttpResponse.json({ ...cat, attributes: sortByOrder(cat.attributes) })
      : new HttpResponse(null, { status: 404 });
  }),

  // Create a new category.
  http.post(`${API_BASE_URL}/categories`, async ({ request }) => {
    const parsed = categoryFormSchema.safeParse(await request.json());
    if (!parsed.success) {
      return HttpResponse.json({ error: parsed.error.issues[0]?.message ?? 'Geçersiz istek' }, { status: 422 });
    }
    if (db.some((c) => c.key === parsed.data.key)) {
      return HttpResponse.json({ error: 'Bu anahtar zaten kullanımda.' }, { status: 422 });
    }
    const order = db.reduce((m, c) => Math.max(m, c.order), -1) + 1;
    const cat: Category = {
      id: `C-${200 + db.length}`,
      key: parsed.data.key,
      label: parsed.data.label,
      description: parsed.data.description,
      ...(parsed.data.icon ? { icon: parsed.data.icon } : {}),
      order,
      status: parsed.data.status,
      attributes: [],
    };
    db.push(cat);
    writeAudit({
      actor: 'user:current',
      action: 'category.create',
      resource: `category:${cat.id}`,
      after: { key: cat.key, label: cat.label, status: cat.status },
    });
    return HttpResponse.json(cat, { status: 201 });
  }),

  // Update category meta (or archive when status flips to archived).
  http.patch(`${API_BASE_URL}/categories/:id`, async ({ params, request }) => {
    const idx = db.findIndex((c) => c.id === params.id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const parsed = categoryFormSchema.safeParse(await request.json());
    if (!parsed.success) {
      return HttpResponse.json({ error: parsed.error.issues[0]?.message ?? 'Geçersiz istek' }, { status: 422 });
    }
    if (db.some((c) => c.key === parsed.data.key && c.id !== params.id)) {
      return HttpResponse.json({ error: 'Bu anahtar zaten kullanımda.' }, { status: 422 });
    }
    const before = db[idx]!;
    const after: Category = {
      ...before,
      key: parsed.data.key,
      label: parsed.data.label,
      description: parsed.data.description,
      status: parsed.data.status,
      ...(parsed.data.icon ? { icon: parsed.data.icon } : {}),
    };
    db[idx] = after;
    const archived = before.status !== 'archived' && after.status === 'archived';
    writeAudit({
      actor: 'user:current',
      action: archived ? 'category.archive' : 'category.update',
      resource: `category:${after.id}`,
      before: { label: before.label, status: before.status },
      after: { label: after.label, status: after.status },
    });
    return HttpResponse.json(after);
  }),

  // Reorder categories by id list; recompute `order`.
  http.post(`${API_BASE_URL}/categories/reorder`, async ({ request }) => {
    const parsed = reorderInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return HttpResponse.json({ error: 'Geçersiz sıralama' }, { status: 422 });
    }
    const rank = new Map(parsed.data.order.map((id, i) => [id, i]));
    db = db.map((c) => (rank.has(c.id) ? { ...c, order: rank.get(c.id)! } : c));
    writeAudit({
      actor: 'user:current',
      action: 'category.reorder',
      resource: 'category:*',
      after: { order: parsed.data.order },
    });
    return HttpResponse.json(getCategoriesSnapshot());
  }),

  // Reorder a category's attributes by attribute-id list.
  http.post(`${API_BASE_URL}/categories/:id/attributes/reorder`, async ({ params, request }) => {
    const idx = db.findIndex((c) => c.id === params.id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const parsed = reorderInputSchema.safeParse(await request.json());
    if (!parsed.success) return HttpResponse.json({ error: 'Geçersiz sıralama' }, { status: 422 });
    const cat = db[idx]!;
    const rank = new Map(parsed.data.order.map((id, i) => [id, i]));
    cat.attributes = cat.attributes.map((a) => (rank.has(a.id) ? { ...a, order: rank.get(a.id)! } : a));
    db[idx] = { ...cat };
    writeAudit({
      actor: 'user:current',
      action: 'attribute.reorder',
      resource: `category:${cat.id}`,
      after: { order: parsed.data.order },
    });
    return HttpResponse.json({ ...cat, attributes: sortByOrder(cat.attributes) });
  }),

  // Upsert a single attribute (create when `id` absent/unknown, else update).
  http.post(`${API_BASE_URL}/categories/:id/attributes`, async ({ params, request }) => {
    const idx = db.findIndex((c) => c.id === params.id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const body = (await request.json()) as { id?: string } & Record<string, unknown>;
    const parsed = attributeFormSchema.safeParse(body);
    if (!parsed.success) {
      return HttpResponse.json({ error: parsed.error.issues[0]?.message ?? 'Geçersiz istek' }, { status: 422 });
    }
    const cat = db[idx]!;
    const existingIdx = body.id ? cat.attributes.findIndex((a) => a.id === body.id) : -1;
    const create = existingIdx === -1;

    const base: Omit<AttributeField, 'id' | 'order'> = {
      key: parsed.data.key,
      label: parsed.data.label,
      type: parsed.data.type,
      required: parsed.data.required,
      ...(parsed.data.unit ? { unit: parsed.data.unit } : {}),
      ...(parsed.data.type === 'select' && parsed.data.options ? { options: parsed.data.options } : {}),
    };

    let attribute: AttributeField;
    if (create) {
      attrSeq += 1;
      const order = cat.attributes.reduce((m, a) => Math.max(m, a.order), -1) + 1;
      attribute = { ...base, id: `${cat.id}-A-new-${attrSeq}`, order };
      cat.attributes = [...cat.attributes, attribute];
    } else {
      const prev = cat.attributes[existingIdx]!;
      attribute = { ...base, id: prev.id, order: prev.order };
      cat.attributes = cat.attributes.map((a, i) => (i === existingIdx ? attribute : a));
    }
    db[idx] = { ...cat };
    writeAudit({
      actor: 'user:current',
      action: create ? 'attribute.create' : 'attribute.update',
      resource: `category:${cat.id}`,
      after: { attribute: attribute.key, type: attribute.type, required: attribute.required },
    });
    return HttpResponse.json(db[idx]);
  }),

  // Delete an attribute.
  http.delete(`${API_BASE_URL}/categories/:id/attributes/:attrId`, ({ params }) => {
    const idx = db.findIndex((c) => c.id === params.id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const cat = db[idx]!;
    const attr = cat.attributes.find((a) => a.id === params.attrId);
    if (!attr) return new HttpResponse(null, { status: 404 });
    cat.attributes = cat.attributes.filter((a) => a.id !== params.attrId);
    db[idx] = { ...cat };
    writeAudit({
      actor: 'user:current',
      action: 'attribute.delete',
      resource: `category:${cat.id}`,
      before: { attribute: attr.key },
    });
    return HttpResponse.json(db[idx]);
  }),
];
