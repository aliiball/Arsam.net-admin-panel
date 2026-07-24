import { http, HttpResponse } from 'msw';

import { API_BASE_URL } from '@/lib/api/client';
import type { Paginated } from '@/lib/api/types';
import { writeAudit } from '@/lib/audit';
import { nextOrder } from '@/lib/order';
import { PAYMENT_METHODS } from '../data/promotions';
import {
  packageFormSchema,
  refundActionSchema,
  refundOutcome,
  remainingAmount,
  type DopingPackage,
  type Payment,
} from '../schemas/promotion';

// ---------------------------------------------------------------------------
// Seed: doping packages
// ---------------------------------------------------------------------------

function seedPackages(): DopingPackage[] {
  const rows: Omit<DopingPackage, 'order'>[] = [
    { id: 'PKG-1', name: 'Öne Çıkar 7 Gün', kind: 'featured', durationDays: 7, price: 149, status: 'active' },
    { id: 'PKG-2', name: 'Vitrin 30 Gün', kind: 'showcase', durationDays: 30, price: 499, status: 'active' },
    { id: 'PKG-3', name: 'Acil 3 Gün', kind: 'urgent', durationDays: 3, price: 89, status: 'active' },
    { id: 'PKG-4', name: 'Üst Sıra 15 Gün', kind: 'top', durationDays: 15, price: 299, status: 'active' },
    { id: 'PKG-5', name: 'Öne Çıkar 30 Gün', kind: 'featured', durationDays: 30, price: 399, status: 'active' },
    { id: 'PKG-6', name: 'Vitrin 7 Gün', kind: 'showcase', durationDays: 7, price: 199, status: 'archived' },
  ];
  return rows.map((r, i) => ({ ...r, order: i }));
}

// ---------------------------------------------------------------------------
// Seed: payments (mixed user/package/method/status; some refund-eligible)
// ---------------------------------------------------------------------------

const BUYERS = [
  { id: 'U-2001', name: 'İstanbul Kaya Emlak' },
  { id: 'U-2002', name: 'Mehmet Yılmaz' },
  { id: 'U-2003', name: 'Ankara Demir Emlak' },
  { id: 'U-2004', name: 'Zeynep Çelik' },
  { id: 'U-2005', name: 'Ege Arslan Emlak' },
  { id: 'U-2006', name: 'Can Öztürk' },
];

/** Status cycle skewed toward `paid` so the refund queue has work. */
const STATUS_CYCLE = ['paid', 'paid', 'paid', 'partially-refunded', 'paid', 'refunded', 'paid', 'failed'] as const;

function seedPayments(pkgs: DopingPackage[]): Payment[] {
  const rows: Payment[] = [];
  for (let i = 0; i < 28; i += 1) {
    const pkg = pkgs[i % pkgs.length]!;
    const buyer = BUYERS[i % BUYERS.length]!;
    const method = PAYMENT_METHODS[i % PAYMENT_METHODS.length]!;
    const status = STATUS_CYCLE[i % STATUS_CYCLE.length]!;
    const amount = pkg.price;
    const refundedAmount =
      status === 'refunded' ? amount : status === 'partially-refunded' ? Math.round(amount / 2) : undefined;

    rows.push({
      id: `PAY-${5000 + i}`,
      invoiceNo: `FT-2026-${1000 + i}`,
      userId: buyer.id,
      userName: buyer.name,
      packageId: pkg.id,
      packageName: pkg.name,
      amount,
      method,
      status,
      createdAt: new Date(2026, 6, 1 + (i % 24), 9 + (i % 10), (i * 11) % 60).toISOString(),
      lineItems: [{ label: pkg.name, quantity: 1, unitPrice: pkg.price }],
      ...(refundedAmount !== undefined ? { refundedAmount } : {}),
    });
  }
  return rows;
}

let packagesDb: DopingPackage[] = seedPackages();
let paymentsDb: Payment[] = seedPayments(packagesDb);

/** Reset the mock DBs (tests). */
export function resetPromotionsDb() {
  packagesDb = seedPackages();
  paymentsDb = seedPayments(packagesDb);
}

export function getPackagesSnapshot(): DopingPackage[] {
  return [...packagesDb];
}

export function getPaymentsSnapshot(): Payment[] {
  return [...paymentsDb];
}

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

function queryPackages(url: URL): Paginated<DopingPackage> {
  const page = Number(url.searchParams.get('page') ?? '1');
  const pageSize = Number(url.searchParams.get('pageSize') ?? '25');
  const q = url.searchParams.get('q')?.toLocaleLowerCase('tr') ?? '';
  const statuses = url.searchParams.getAll('status');
  const kinds = url.searchParams.getAll('kind');
  const sortRaw = url.searchParams.get('sort');

  let items = packagesDb.filter((p) => {
    if (q && !p.name.toLocaleLowerCase('tr').includes(q)) return false;
    if (statuses.length && !statuses.includes(p.status)) return false;
    if (kinds.length && !kinds.includes(p.kind)) return false;
    return true;
  });

  if (sortRaw) {
    const [field, dir] = sortRaw.split(',')[0]!.split(':');
    items = [...items].sort((a, b) => {
      const av = a[field as keyof DopingPackage] as string | number;
      const bv = b[field as keyof DopingPackage] as string | number;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return dir === 'desc' ? -cmp : cmp;
    });
  } else {
    items = [...items].sort((a, b) => a.order - b.order);
  }

  const total = items.length;
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total, page, pageSize };
}

function queryPayments(url: URL): Paginated<Payment> {
  const page = Number(url.searchParams.get('page') ?? '1');
  const pageSize = Number(url.searchParams.get('pageSize') ?? '25');
  const q = url.searchParams.get('q')?.toLocaleLowerCase('tr') ?? '';
  const statuses = url.searchParams.getAll('status');
  const methods = url.searchParams.getAll('method');
  const from = url.searchParams.get('createdAtFrom');
  const to = url.searchParams.get('createdAtTo');
  const sortRaw = url.searchParams.get('sort');

  let items = paymentsDb.filter((p) => {
    if (
      q &&
      !p.invoiceNo.toLocaleLowerCase('tr').includes(q) &&
      !p.userName.toLocaleLowerCase('tr').includes(q) &&
      !p.packageName.toLocaleLowerCase('tr').includes(q)
    )
      return false;
    if (statuses.length && !statuses.includes(p.status)) return false;
    if (methods.length && !methods.includes(p.method)) return false;
    if (from && p.createdAt < from) return false;
    if (to && p.createdAt > `${to}T23:59:59.999Z`) return false;
    return true;
  });

  if (sortRaw) {
    const [field, dir] = sortRaw.split(',')[0]!.split(':');
    items = [...items].sort((a, b) => {
      const av = a[field as keyof Payment] as string | number;
      const bv = b[field as keyof Payment] as string | number;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return dir === 'desc' ? -cmp : cmp;
    });
  } else {
    items = [...items].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  const total = items.length;
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total, page, pageSize };
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

export const promotionsHandlers = [
  // -- Packages -------------------------------------------------------------
  http.get(`${API_BASE_URL}/packages`, ({ request }) => HttpResponse.json(queryPackages(new URL(request.url)))),

  http.get(`${API_BASE_URL}/packages/:id`, ({ params }) => {
    const pkg = packagesDb.find((p) => p.id === params.id);
    return pkg ? HttpResponse.json(pkg) : new HttpResponse(null, { status: 404 });
  }),

  http.post(`${API_BASE_URL}/packages`, async ({ request }) => {
    const parsed = packageFormSchema.safeParse(await request.json());
    if (!parsed.success) {
      return HttpResponse.json({ error: parsed.error.issues[0]?.message ?? 'Geçersiz istek' }, { status: 422 });
    }
    // The form keeps numeric fields as strings; parse them here.
    const v = parsed.data;
    const created: DopingPackage = {
      id: `PKG-new-${packagesDb.length + 1}`,
      name: v.name.trim(),
      kind: v.kind,
      durationDays: Number(v.durationDays),
      price: Number(v.price),
      status: v.status,
      order: nextOrder(packagesDb),
    };
    packagesDb = [...packagesDb, created];
    writeAudit({
      actor: 'user:current',
      action: 'package.create',
      resource: `package:${created.id}`,
      after: { name: created.name, kind: created.kind, price: created.price, status: created.status },
    });
    return HttpResponse.json(created, { status: 201 });
  }),

  http.patch(`${API_BASE_URL}/packages/:id`, async ({ params, request }) => {
    const idx = packagesDb.findIndex((p) => p.id === params.id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const parsed = packageFormSchema.safeParse(await request.json());
    if (!parsed.success) {
      return HttpResponse.json({ error: parsed.error.issues[0]?.message ?? 'Geçersiz istek' }, { status: 422 });
    }
    const before = packagesDb[idx]!;
    const v = parsed.data;
    const after: DopingPackage = {
      ...before,
      name: v.name.trim(),
      kind: v.kind,
      durationDays: Number(v.durationDays),
      price: Number(v.price),
      status: v.status,
    };
    packagesDb[idx] = after;
    const archived = before.status !== 'archived' && after.status === 'archived';
    writeAudit({
      actor: 'user:current',
      action: archived ? 'package.archive' : 'package.update',
      resource: `package:${after.id}`,
      before: { name: before.name, price: before.price, status: before.status },
      after: { name: after.name, price: after.price, status: after.status },
    });
    return HttpResponse.json(after);
  }),

  // -- Payments -------------------------------------------------------------
  http.get(`${API_BASE_URL}/payments`, ({ request }) => HttpResponse.json(queryPayments(new URL(request.url)))),

  http.get(`${API_BASE_URL}/payments/:id`, ({ params }) => {
    const payment = paymentsDb.find((p) => p.id === params.id);
    return payment ? HttpResponse.json(payment) : new HttpResponse(null, { status: 404 });
  }),

  http.post(`${API_BASE_URL}/payments/:id/refund`, async ({ params, request }) => {
    const idx = paymentsDb.findIndex((p) => p.id === params.id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const parsed = refundActionSchema.safeParse(await request.json());
    if (!parsed.success) {
      return HttpResponse.json({ error: parsed.error.issues[0]?.message ?? 'Geçersiz istek' }, { status: 422 });
    }
    const before = paymentsDb[idx]!;
    const remaining = remainingAmount(before);
    if (before.status !== 'paid' && before.status !== 'partially-refunded') {
      return HttpResponse.json({ error: 'Bu ödeme iade edilemez.' }, { status: 422 });
    }
    if (parsed.data.amount > remaining) {
      return HttpResponse.json(
        { error: `İade tutarı kalan tutarı (${remaining}) aşamaz.` },
        { status: 422 },
      );
    }
    const outcome = refundOutcome(before, parsed.data.amount);
    const after: Payment = { ...before, status: outcome.status, refundedAmount: outcome.refundedAmount };
    paymentsDb[idx] = after;
    writeAudit({
      actor: 'user:current',
      action: 'payment.refund',
      resource: `payment:${before.id}`,
      before: { status: before.status, refundedAmount: before.refundedAmount ?? 0 },
      after: {
        status: after.status,
        refundedAmount: after.refundedAmount,
        refunded: parsed.data.amount,
        partial: outcome.status === 'partially-refunded',
        reason: parsed.data.reason,
      },
    });
    return HttpResponse.json(after);
  }),
];
