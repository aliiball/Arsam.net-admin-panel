import { http, HttpResponse } from 'msw';

import { API_BASE_URL } from '@/lib/api/client';
import type { Paginated } from '@/lib/api/types';
import { writeAudit } from '@/lib/audit';
import { buildSeedProvinces } from '../data/locations';
import {
  districtFormSchema,
  neighborhoodFormSchema,
  provinceFormSchema,
  reorderInputSchema,
  sortByOrder,
  type District,
  type Neighborhood,
  type Province,
} from '../schemas/location';

function seed(): Province[] {
  return buildSeedProvinces().map((p) => ({
    id: `P-${p.code}`,
    code: p.code,
    label: p.label,
    order: Number(p.code),
    status: 'active' as const,
    districts: p.districts.map((d, di) => ({
      id: `P-${p.code}-D-${di}`,
      key: d.key,
      label: d.label,
      order: di,
      status: 'active' as const,
      neighborhoods: d.neighborhoods.map((n, ni) => ({
        id: `P-${p.code}-D-${di}-N-${ni}`,
        name: n.name,
        order: ni,
      })),
    })),
  }));
}

let db: Province[] = seed();
let seq = 0;

/** Reset the mock DB (tests). */
export function resetLocationsDb() {
  db = seed();
  seq = 0;
}

/** Sorted read bridge for the listing form + filters (future binding). */
export function getLocationsSnapshot(): Province[] {
  return sortByOrder(db).map((p) => ({
    ...p,
    districts: sortByOrder(p.districts).map((d) => ({ ...d, neighborhoods: sortByOrder(d.neighborhoods) })),
  }));
}

function withSortedChildren(p: Province): Province {
  return {
    ...p,
    districts: sortByOrder(p.districts).map((d) => ({ ...d, neighborhoods: sortByOrder(d.neighborhoods) })),
  };
}

function applyQuery(url: URL): Paginated<Province> {
  const page = Number(url.searchParams.get('page') ?? '1');
  const pageSize = Number(url.searchParams.get('pageSize') ?? '25');
  const q = url.searchParams.get('q')?.toLocaleLowerCase('tr') ?? '';
  const statuses = url.searchParams.getAll('status');
  const sortRaw = url.searchParams.get('sort');

  let items = db.filter((p) => {
    if (q && !p.label.toLocaleLowerCase('tr').includes(q) && !p.code.includes(q)) return false;
    if (statuses.length && !statuses.includes(p.status)) return false;
    return true;
  });

  if (sortRaw) {
    const [field, dir] = sortRaw.split(',')[0]!.split(':');
    items = [...items].sort((a, b) => {
      const av = a[field as keyof Province] as string | number;
      const bv = b[field as keyof Province] as string | number;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return dir === 'desc' ? -cmp : cmp;
    });
  } else {
    items = sortByOrder(items);
  }

  const total = items.length;
  const start = (page - 1) * pageSize;
  const slice = items.slice(start, start + pageSize).map(withSortedChildren);
  return { items: slice, total, page, pageSize };
}

const B = API_BASE_URL;

export const locationsHandlers = [
  http.get(`${B}/provinces`, ({ request }) => HttpResponse.json(applyQuery(new URL(request.url)))),

  http.get(`${B}/provinces/:id`, ({ params }) => {
    const p = db.find((x) => x.id === params.id);
    return p ? HttpResponse.json(withSortedChildren(p)) : new HttpResponse(null, { status: 404 });
  }),

  // Create a province.
  http.post(`${B}/provinces`, async ({ request }) => {
    const parsed = provinceFormSchema.safeParse(await request.json());
    if (!parsed.success) {
      return HttpResponse.json({ error: parsed.error.issues[0]?.message ?? 'Geçersiz istek' }, { status: 422 });
    }
    if (db.some((p) => p.code === parsed.data.code)) {
      return HttpResponse.json({ error: 'Bu plaka kodu zaten kullanımda.' }, { status: 422 });
    }
    const order = db.reduce((m, p) => Math.max(m, p.order), -1) + 1;
    seq += 1;
    const province: Province = {
      id: `P-new-${seq}`,
      code: parsed.data.code,
      label: parsed.data.label,
      order,
      status: parsed.data.status,
      districts: [],
    };
    db.push(province);
    writeAudit({
      actor: 'user:current',
      action: 'location.create',
      resource: `province:${province.id}`,
      after: { level: 'province', code: province.code, label: province.label, status: province.status },
    });
    return HttpResponse.json(province, { status: 201 });
  }),

  // Update province meta (or archive when status flips to archived).
  http.patch(`${B}/provinces/:id`, async ({ params, request }) => {
    const idx = db.findIndex((p) => p.id === params.id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const parsed = provinceFormSchema.safeParse(await request.json());
    if (!parsed.success) {
      return HttpResponse.json({ error: parsed.error.issues[0]?.message ?? 'Geçersiz istek' }, { status: 422 });
    }
    if (db.some((p) => p.code === parsed.data.code && p.id !== params.id)) {
      return HttpResponse.json({ error: 'Bu plaka kodu zaten kullanımda.' }, { status: 422 });
    }
    const before = db[idx]!;
    const after: Province = {
      ...before,
      code: parsed.data.code,
      label: parsed.data.label,
      status: parsed.data.status,
    };
    db[idx] = after;
    const archived = before.status !== 'archived' && after.status === 'archived';
    writeAudit({
      actor: 'user:current',
      action: archived ? 'location.archive' : 'location.update',
      resource: `province:${after.id}`,
      before: { level: 'province', label: before.label, status: before.status },
      after: { level: 'province', label: after.label, status: after.status },
    });
    return HttpResponse.json(after);
  }),

  // Reorder provinces by id list.
  http.post(`${B}/provinces/reorder`, async ({ request }) => {
    const parsed = reorderInputSchema.safeParse(await request.json());
    if (!parsed.success) return HttpResponse.json({ error: 'Geçersiz sıralama' }, { status: 422 });
    const rank = new Map(parsed.data.order.map((id, i) => [id, i]));
    db = db.map((p) => (rank.has(p.id) ? { ...p, order: rank.get(p.id)! } : p));
    writeAudit({
      actor: 'user:current',
      action: 'location.reorder',
      resource: 'province:*',
      after: { level: 'province', order: parsed.data.order },
    });
    return HttpResponse.json(getLocationsSnapshot());
  }),

  // Upsert a district (create when `id` absent/unknown, else update).
  http.post(`${B}/provinces/:id/districts`, async ({ params, request }) => {
    const idx = db.findIndex((p) => p.id === params.id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const body = (await request.json()) as { id?: string } & Record<string, unknown>;
    const parsed = districtFormSchema.safeParse(body);
    if (!parsed.success) {
      return HttpResponse.json({ error: parsed.error.issues[0]?.message ?? 'Geçersiz istek' }, { status: 422 });
    }
    const province = db[idx]!;
    const existingIdx = body.id ? province.districts.findIndex((d) => d.id === body.id) : -1;
    const create = existingIdx === -1;
    if (province.districts.some((d) => d.key === parsed.data.key && d.id !== body.id)) {
      return HttpResponse.json({ error: 'Bu ilçe anahtarı bu ilde zaten var.' }, { status: 422 });
    }

    let district: District;
    if (create) {
      seq += 1;
      const order = province.districts.reduce((m, d) => Math.max(m, d.order), -1) + 1;
      district = {
        id: `${province.id}-D-new-${seq}`,
        key: parsed.data.key,
        label: parsed.data.label,
        status: parsed.data.status,
        order,
        neighborhoods: [],
      };
      province.districts = [...province.districts, district];
    } else {
      const prev = province.districts[existingIdx]!;
      district = { ...prev, key: parsed.data.key, label: parsed.data.label, status: parsed.data.status };
      province.districts = province.districts.map((d, i) => (i === existingIdx ? district : d));
    }
    db[idx] = { ...province };
    const archived = !create && parsed.data.status === 'archived';
    writeAudit({
      actor: 'user:current',
      action: create ? 'location.create' : archived ? 'location.archive' : 'location.update',
      resource: `province:${province.id}`,
      after: { level: 'district', key: district.key, label: district.label, status: district.status },
    });
    return HttpResponse.json(withSortedChildren(db[idx]!));
  }),

  // Reorder a province's districts by district-id list.
  http.post(`${B}/provinces/:id/districts/reorder`, async ({ params, request }) => {
    const idx = db.findIndex((p) => p.id === params.id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const parsed = reorderInputSchema.safeParse(await request.json());
    if (!parsed.success) return HttpResponse.json({ error: 'Geçersiz sıralama' }, { status: 422 });
    const province = db[idx]!;
    const rank = new Map(parsed.data.order.map((id, i) => [id, i]));
    province.districts = province.districts.map((d) => (rank.has(d.id) ? { ...d, order: rank.get(d.id)! } : d));
    db[idx] = { ...province };
    writeAudit({
      actor: 'user:current',
      action: 'location.reorder',
      resource: `province:${province.id}`,
      after: { level: 'district', order: parsed.data.order },
    });
    return HttpResponse.json(withSortedChildren(db[idx]!));
  }),

  // Delete a district.
  http.delete(`${B}/provinces/:id/districts/:districtId`, ({ params }) => {
    const idx = db.findIndex((p) => p.id === params.id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const province = db[idx]!;
    const district = province.districts.find((d) => d.id === params.districtId);
    if (!district) return new HttpResponse(null, { status: 404 });
    province.districts = province.districts.filter((d) => d.id !== params.districtId);
    db[idx] = { ...province };
    writeAudit({
      actor: 'user:current',
      action: 'location.delete',
      resource: `province:${province.id}`,
      before: { level: 'district', key: district.key, label: district.label },
    });
    return HttpResponse.json(withSortedChildren(db[idx]!));
  }),

  // Upsert a neighborhood within a district.
  http.post(`${B}/provinces/:id/districts/:districtId/neighborhoods`, async ({ params, request }) => {
    const idx = db.findIndex((p) => p.id === params.id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const province = db[idx]!;
    const dIdx = province.districts.findIndex((d) => d.id === params.districtId);
    if (dIdx === -1) return new HttpResponse(null, { status: 404 });
    const body = (await request.json()) as { id?: string } & Record<string, unknown>;
    const parsed = neighborhoodFormSchema.safeParse(body);
    if (!parsed.success) {
      return HttpResponse.json({ error: parsed.error.issues[0]?.message ?? 'Geçersiz istek' }, { status: 422 });
    }
    const district = province.districts[dIdx]!;
    const existingIdx = body.id ? district.neighborhoods.findIndex((n) => n.id === body.id) : -1;
    const create = existingIdx === -1;

    let neighborhood: Neighborhood;
    if (create) {
      seq += 1;
      const order = district.neighborhoods.reduce((m, n) => Math.max(m, n.order), -1) + 1;
      neighborhood = { id: `${district.id}-N-new-${seq}`, name: parsed.data.name, order };
      district.neighborhoods = [...district.neighborhoods, neighborhood];
    } else {
      const prev = district.neighborhoods[existingIdx]!;
      neighborhood = { ...prev, name: parsed.data.name };
      district.neighborhoods = district.neighborhoods.map((n, i) => (i === existingIdx ? neighborhood : n));
    }
    province.districts = province.districts.map((d, i) => (i === dIdx ? { ...district } : d));
    db[idx] = { ...province };
    writeAudit({
      actor: 'user:current',
      action: create ? 'location.create' : 'location.update',
      resource: `province:${province.id}`,
      after: { level: 'neighborhood', district: district.key, name: neighborhood.name },
    });
    return HttpResponse.json(withSortedChildren(db[idx]!));
  }),

  // Reorder neighborhoods within a district.
  http.post(`${B}/provinces/:id/districts/:districtId/neighborhoods/reorder`, async ({ params, request }) => {
    const idx = db.findIndex((p) => p.id === params.id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const province = db[idx]!;
    const dIdx = province.districts.findIndex((d) => d.id === params.districtId);
    if (dIdx === -1) return new HttpResponse(null, { status: 404 });
    const parsed = reorderInputSchema.safeParse(await request.json());
    if (!parsed.success) return HttpResponse.json({ error: 'Geçersiz sıralama' }, { status: 422 });
    const district = province.districts[dIdx]!;
    const rank = new Map(parsed.data.order.map((id, i) => [id, i]));
    district.neighborhoods = district.neighborhoods.map((n) => (rank.has(n.id) ? { ...n, order: rank.get(n.id)! } : n));
    province.districts = province.districts.map((d, i) => (i === dIdx ? { ...district } : d));
    db[idx] = { ...province };
    writeAudit({
      actor: 'user:current',
      action: 'location.reorder',
      resource: `province:${province.id}`,
      after: { level: 'neighborhood', district: district.key, order: parsed.data.order },
    });
    return HttpResponse.json(withSortedChildren(db[idx]!));
  }),

  // Delete a neighborhood.
  http.delete(`${B}/provinces/:id/districts/:districtId/neighborhoods/:neighborhoodId`, ({ params }) => {
    const idx = db.findIndex((p) => p.id === params.id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const province = db[idx]!;
    const dIdx = province.districts.findIndex((d) => d.id === params.districtId);
    if (dIdx === -1) return new HttpResponse(null, { status: 404 });
    const district = province.districts[dIdx]!;
    const neighborhood = district.neighborhoods.find((n) => n.id === params.neighborhoodId);
    if (!neighborhood) return new HttpResponse(null, { status: 404 });
    district.neighborhoods = district.neighborhoods.filter((n) => n.id !== params.neighborhoodId);
    province.districts = province.districts.map((d, i) => (i === dIdx ? { ...district } : d));
    db[idx] = { ...province };
    writeAudit({
      actor: 'user:current',
      action: 'location.delete',
      resource: `province:${province.id}`,
      before: { level: 'neighborhood', district: district.key, name: neighborhood.name },
    });
    return HttpResponse.json(withSortedChildren(db[idx]!));
  }),
];
