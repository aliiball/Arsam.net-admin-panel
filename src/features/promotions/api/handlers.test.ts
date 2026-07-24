import { beforeEach, describe, expect, it } from 'vitest';

import { api, ApiError } from '@/lib/api/client';
import type { Paginated } from '@/lib/api/types';
import { getAuditFor } from '@/lib/audit';
import { getPackagesSnapshot, getPaymentsSnapshot, resetPromotionsDb } from './handlers';
import { remainingAmount, type DopingPackage, type Payment } from '../schemas/promotion';

beforeEach(() => resetPromotionsDb());

describe('packages handlers', () => {
  it('returns the paginated envelope and filters by status', async () => {
    const res = await api.list<DopingPackage>('packages', {
      page: 1,
      pageSize: 10,
      filters: { status: 'active' },
    });
    expect(res.total).toBeGreaterThan(0);
    expect(res.items.every((p) => p.status === 'active')).toBe(true);
  });

  it('filters by kind and sorts by price ascending', async () => {
    const res = await api.get<Paginated<DopingPackage>>(
      '/packages',
      new URLSearchParams({ kind: 'featured', sort: 'price:asc', pageSize: '50' }),
    );
    expect(res.items.every((p) => p.kind === 'featured')).toBe(true);
    const prices = res.items.map((p) => p.price);
    expect([...prices].sort((a, b) => a - b)).toEqual(prices);
  });

  it('creates a package (numeric-strings parsed) and writes an audit entry', async () => {
    const created = await api.post<DopingPackage>('/packages', {
      name: 'Test Paket',
      kind: 'top',
      durationDays: '10',
      price: '250',
      status: 'active',
    });
    expect(created.durationDays).toBe(10);
    expect(created.price).toBe(250);
    expect(getAuditFor(`package:${created.id}`)[0]?.action).toBe('package.create');
  });

  it('rejects an invalid create (non-numeric price → 422)', async () => {
    const err = await api
      .post<DopingPackage>('/packages', { name: 'X', kind: 'top', durationDays: '10', price: 'abc', status: 'active' })
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(422);
  });

  it('archives a package via PATCH and writes a package.archive audit entry', async () => {
    const active = getPackagesSnapshot().find((p) => p.status === 'active')!;
    const after = await api.patch<DopingPackage>(`/packages/${active.id}`, {
      name: active.name,
      kind: active.kind,
      durationDays: String(active.durationDays),
      price: String(active.price),
      status: 'archived',
    });
    expect(after.status).toBe('archived');
    expect(getAuditFor(`package:${active.id}`)[0]?.action).toBe('package.archive');
  });
});

describe('payments handlers', () => {
  it('returns the paginated envelope and filters by method', async () => {
    const res = await api.list<Payment>('payments', { page: 1, pageSize: 50, filters: { method: 'card' } });
    expect(res.total).toBeGreaterThan(0);
    expect(res.items.every((p) => p.method === 'card')).toBe(true);
  });

  it('sorts by amount descending', async () => {
    const res = await api.get<Paginated<Payment>>('/payments', new URLSearchParams({ sort: 'amount:desc', pageSize: '50' }));
    const amounts = res.items.map((p) => p.amount);
    expect([...amounts].sort((a, b) => b - a)).toEqual(amounts);
  });

  it('rejects a refund without a reason (guardrail → 422) and leaves the payment untouched', async () => {
    const payment = getPaymentsSnapshot().find((p) => p.status === 'paid')!;
    const err = await api.post<Payment>(`/payments/${payment.id}/refund`, { amount: 10 }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(422);
    const still = await api.get<Payment>(`/payments/${payment.id}`);
    expect(still.status).toBe('paid');
  });

  it('rejects a refund exceeding the remaining balance (amount > remaining → 422)', async () => {
    const payment = getPaymentsSnapshot().find((p) => p.status === 'paid')!;
    const err = await api
      .post<Payment>(`/payments/${payment.id}/refund`, { amount: payment.amount + 1, reason: 'Fazla tutar' })
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(422);
  });

  it('applies a partial refund → partially-refunded + audit', async () => {
    const payment = getPaymentsSnapshot().find((p) => p.status === 'paid')!;
    const amount = Math.max(1, Math.floor(payment.amount / 3));
    const after = await api.post<Payment>(`/payments/${payment.id}/refund`, { amount, reason: 'Kısmi iade talebi' });
    expect(after.status).toBe('partially-refunded');
    expect(after.refundedAmount).toBe(amount);
    expect(remainingAmount(after)).toBe(payment.amount - amount);
    const audit = getAuditFor(`payment:${payment.id}`)[0];
    expect(audit?.action).toBe('payment.refund');
    expect(audit?.after).toMatchObject({ partial: true, reason: 'Kısmi iade talebi' });
  });

  it('applies a full refund → refunded', async () => {
    const payment = getPaymentsSnapshot().find((p) => p.status === 'paid')!;
    const after = await api.post<Payment>(`/payments/${payment.id}/refund`, {
      amount: payment.amount,
      reason: 'Tam iade talebi',
    });
    expect(after.status).toBe('refunded');
    expect(after.refundedAmount).toBe(payment.amount);
    expect(remainingAmount(after)).toBe(0);
  });

  it('finishes a partially-refunded payment with a second refund → refunded', async () => {
    const payment = getPaymentsSnapshot().find((p) => p.status === 'partially-refunded')!;
    const remaining = remainingAmount(payment);
    const after = await api.post<Payment>(`/payments/${payment.id}/refund`, {
      amount: remaining,
      reason: 'Kalan tutar iade edildi',
    });
    expect(after.status).toBe('refunded');
    expect(remainingAmount(after)).toBe(0);
  });
});

describe('pure money helpers', () => {
  it('remainingAmount never goes negative', () => {
    expect(remainingAmount({ amount: 100, refundedAmount: 40 })).toBe(60);
    expect(remainingAmount({ amount: 100, refundedAmount: 200 })).toBe(0);
    expect(remainingAmount({ amount: 100 })).toBe(100);
  });
});
