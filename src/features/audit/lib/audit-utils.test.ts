import { describe, expect, it } from 'vitest';

import type { AuditEntry } from '@/lib/audit';
import {
  actionFamily,
  actorKind,
  auditDiff,
  auditReason,
  filterAuditEntries,
  isKnownFamily,
} from './audit-utils';

const ENTRIES: AuditEntry[] = [
  { id: 'a1', actor: 'ai:moderator', action: 'listing.hold', resource: 'listing:L-1', before: { status: 'pending' }, after: { status: 'pending', reason: 'İnsan onayı bekleniyor' }, ts: '2026-07-20T09:00:00.000Z' },
  { id: 'a2', actor: 'user:current', action: 'user.suspend', resource: 'user:U-1', before: { status: 'active' }, after: { status: 'suspended', reason: 'Spam' }, ts: '2026-07-21T10:00:00.000Z' },
  { id: 'a3', actor: 'user:current', action: 'attribute.create', resource: 'category:konut', before: undefined, after: { key: 'rooms' }, ts: '2026-07-22T11:00:00.000Z' },
  { id: 'a4', actor: 'ai:risk-scanner', action: 'report.escalate', resource: 'report:R-1', before: { status: 'open' }, after: { status: 'escalated' }, ts: '2026-07-23T12:00:00.000Z' },
  { id: 'a5', actor: 'user:current', action: 'payment.refund', resource: 'payment:PAY-1', before: { status: 'paid' }, after: { status: 'refunded' }, ts: '2026-07-24T13:00:00.000Z' },
];

describe('actorKind', () => {
  it('splits ai:* from human actors', () => {
    expect(actorKind('ai:moderator')).toBe('ai');
    expect(actorKind('user:current')).toBe('human');
  });
});

describe('actionFamily', () => {
  it('takes the prefix and folds attribute.* into category', () => {
    expect(actionFamily('listing.approve')).toBe('listing');
    expect(actionFamily('attribute.create')).toBe('category');
    expect(actionFamily('payment.refund')).toBe('payment');
  });
  it('isKnownFamily gates the facet', () => {
    expect(isKnownFamily('listing')).toBe(true);
    expect(isKnownFamily('attribute')).toBe(false);
  });
});

describe('auditReason', () => {
  it('pulls a non-empty reason from after, then before', () => {
    expect(auditReason(ENTRIES[0]!)).toBe('İnsan onayı bekleniyor');
    expect(auditReason(ENTRIES[3]!)).toBeUndefined();
  });
});

describe('auditDiff', () => {
  it('lists changed keys excluding reason', () => {
    const diff = auditDiff({ status: 'active' }, { status: 'suspended', reason: 'Spam' });
    expect(diff).toEqual([{ key: 'status', before: 'active', after: 'suspended' }]);
  });
  it('handles a missing before snapshot', () => {
    expect(auditDiff(undefined, { key: 'rooms' })).toEqual([{ key: 'key', before: '—', after: 'rooms' }]);
  });
  it('skips unchanged keys', () => {
    expect(auditDiff({ status: 'pending' }, { status: 'pending' })).toEqual([]);
  });
});

describe('filterAuditEntries (pure)', () => {
  it('defaults to newest-first', () => {
    const out = filterAuditEntries(ENTRIES, {});
    expect(out.map((e) => e.id)).toEqual(['a5', 'a4', 'a3', 'a2', 'a1']);
  });

  it('filters by action family (attribute counts as category)', () => {
    const out = filterAuditEntries(ENTRIES, { families: ['category'] });
    expect(out.map((e) => e.id)).toEqual(['a3']);
  });

  it('filters by actor kind', () => {
    const ai = filterAuditEntries(ENTRIES, { actorKinds: ['ai'] });
    expect(ai.map((e) => e.id).sort()).toEqual(['a1', 'a4']);
    const human = filterAuditEntries(ENTRIES, { actorKinds: ['human'] });
    expect(human.map((e) => e.id).sort()).toEqual(['a2', 'a3', 'a5']);
  });

  it('filters by date range (inclusive of the to-day)', () => {
    const out = filterAuditEntries(ENTRIES, { from: '2026-07-21', to: '2026-07-23' });
    expect(out.map((e) => e.id).sort()).toEqual(['a2', 'a3', 'a4']);
  });

  it('free-text searches resource, action, actor, and reason', () => {
    expect(filterAuditEntries(ENTRIES, { q: 'spam' }).map((e) => e.id)).toEqual(['a2']);
    expect(filterAuditEntries(ENTRIES, { q: 'risk-scanner' }).map((e) => e.id)).toEqual(['a4']);
    expect(filterAuditEntries(ENTRIES, { q: 'L-1' }).map((e) => e.id)).toEqual(['a1']);
  });

  it('sorts by an explicit field/direction', () => {
    const out = filterAuditEntries(ENTRIES, { sort: [{ id: 'actor', desc: false }] });
    expect(out[0]!.actor.startsWith('ai:')).toBe(true);
  });

  it('is deterministic and does not mutate the input', () => {
    const copy = [...ENTRIES];
    const a = filterAuditEntries(ENTRIES, { families: ['listing', 'payment'] });
    const b = filterAuditEntries(ENTRIES, { families: ['listing', 'payment'] });
    expect(a).toEqual(b);
    expect(ENTRIES).toEqual(copy);
  });
});
