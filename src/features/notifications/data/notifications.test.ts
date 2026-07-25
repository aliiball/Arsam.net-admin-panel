import { describe, expect, it } from 'vitest';

import type { AuditEntry } from '@/lib/audit';
import type { Listing } from '@/features/listings/schemas/listing';
import {
  auditResourceRoute,
  deriveNotifications,
  formatAuditTitle,
} from './notifications';

function listing(id: string, status: Listing['status'], createdAt: string): Listing {
  return {
    id,
    title: `İlan ${id}`,
    description: 'Test ilanı',
    category: 'konut',
    price: 1000,
    status,
    il: '34',
    ilce: 'kadikoy',
    mahalle: 'Moda',
    attributes: { grossArea: 100 },
    agentName: 'Ofis',
    aiSuggestion: 'ok',
    aiReasons: [],
    createdAt,
  };
}

function audit(id: string, action: string, resource: string, ts: string): AuditEntry {
  return { id, actor: 'u1', action, resource, ts };
}

describe('formatAuditTitle', () => {
  it('humanizes family.verb into Turkish', () => {
    expect(formatAuditTitle('listing.approve')).toBe('İlan onaylandı');
    expect(formatAuditTitle('user.suspend')).toBe('Kullanıcı askıya alındı');
    expect(formatAuditTitle('payment.refund')).toBe('Ödeme iade edildi');
  });

  it('falls back to raw tokens for unknown parts', () => {
    expect(formatAuditTitle('widget.frobnicate')).toBe('widget frobnicate');
  });
});

describe('auditResourceRoute', () => {
  it('deep-links families with a detail route', () => {
    expect(auditResourceRoute('listing:L-1001')).toBe('/listings/L-1001');
    expect(auditResourceRoute('report:R-1')).toBe('/messages/R-1');
    expect(auditResourceRoute('user:U-9')).toBe('/users/U-9');
  });

  it('routes non-detail families to their list route', () => {
    expect(auditResourceRoute('flag:dockLayout')).toBe('/settings');
    expect(auditResourceRoute('payment:P-1')).toBe('/promotions/payments');
  });

  it('falls back to /audit for unknown families and wildcard ids', () => {
    expect(auditResourceRoute('mystery:X-1')).toBe('/audit');
    expect(auditResourceRoute('province:*')).toBe('/audit');
  });
});

describe('deriveNotifications', () => {
  it('summarizes the pending moderation queue and sets the unread count', () => {
    const listings = [
      listing('L-1', 'pending', '2026-07-01'),
      listing('L-2', 'pending', '2026-07-03'),
      listing('L-3', 'active', '2026-07-02'),
    ];
    const payload = deriveNotifications(listings, []);
    expect(payload.unread).toBe(2);
    const moderation = payload.items.find((i) => i.kind === 'moderation');
    expect(moderation?.title).toBe('2 ilan moderasyon bekliyor');
    expect(moderation?.to).toBe('/listings/moderation');
    // ts is the newest pending createdAt (deterministic).
    expect(moderation?.ts).toBe('2026-07-03');
  });

  it('omits the moderation item and zeroes unread when nothing is pending', () => {
    const payload = deriveNotifications([listing('L-3', 'active', '2026-07-02')], []);
    expect(payload.unread).toBe(0);
    expect(payload.items.some((i) => i.kind === 'moderation')).toBe(false);
  });

  it('appends the most recent audit entries as deep-linkable items (limit honored)', () => {
    const auditLog = [
      audit('a1', 'listing.approve', 'listing:L-1', '2026-07-05'),
      audit('a2', 'user.ban', 'user:U-2', '2026-07-04'),
      audit('a3', 'report.resolve', 'report:R-3', '2026-07-03'),
    ];
    const payload = deriveNotifications([], auditLog, { auditLimit: 2 });
    const auditItems = payload.items.filter((i) => i.kind === 'audit');
    expect(auditItems).toHaveLength(2);
    expect(auditItems[0]).toMatchObject({ title: 'İlan onaylandı', to: '/listings/L-1' });
  });
});
