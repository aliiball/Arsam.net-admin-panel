import { describe, expect, it, vi } from 'vitest';

import { applyIntent, filtersToSearch, selectApprovable, type Moderatable } from './apply-intent';
import type { BulkActionIntent, FilterIntent, NavigateIntent } from './intent';

const ROWS: Moderatable[] = [
  { id: 'L-1', status: 'pending', aiSuggestion: 'ok' },
  { id: 'L-2', status: 'pending', aiSuggestion: 'uncertain' },
  { id: 'L-3', status: 'pending', aiSuggestion: 'nok' },
  { id: 'L-4', status: 'active', aiSuggestion: 'ok' },
  { id: 'L-5', status: 'pending', aiSuggestion: 'ok' },
];

const BULK: BulkActionIntent = {
  kind: 'bulk-action',
  action: 'approve-ai-ok',
  entity: 'listing',
  to: '/listings',
  label: 'onayla',
};

describe('selectApprovable — only AI-OK + pending', () => {
  it('excludes uncertain, nok, and non-pending rows', () => {
    expect(selectApprovable(ROWS).map((r) => r.id)).toEqual(['L-1', 'L-5']);
  });
});

describe('filtersToSearch', () => {
  it('serializes scalar + array params deterministically', () => {
    expect(filtersToSearch({ status: 'pending', il: '34' })).toBe('status=pending&il=34');
    expect(filtersToSearch({ category: ['konut', 'arsa'] })).toBe('category=konut&category=arsa');
  });
});

describe('applyIntent — non-destructive intents apply on click', () => {
  it('navigates for a navigate intent', async () => {
    const onNavigate = vi.fn();
    const intent: NavigateIntent = { kind: 'navigate', to: '/users', label: 'Kullanıcılar' };
    const res = await applyIntent(intent, { confirmed: false, onNavigate });
    expect(res).toEqual({ kind: 'navigated', to: '/users' });
    expect(onNavigate).toHaveBeenCalledWith('/users');
  });

  it('navigates to a filtered list route for a filter intent', async () => {
    const onNavigate = vi.fn();
    const intent: FilterIntent = {
      kind: 'filter',
      entity: 'listing',
      to: '/listings',
      filters: { status: 'pending', il: '34' },
      chips: [],
    };
    const res = await applyIntent(intent, { confirmed: false, onNavigate });
    expect(res).toEqual({ kind: 'filtered', to: '/listings?status=pending&il=34' });
    expect(onNavigate).toHaveBeenCalledWith('/listings?status=pending&il=34');
  });
});

describe('applyIntent — bulk-action GUARDRAIL', () => {
  it('THROWS and never writes when unconfirmed', async () => {
    const onBulkApprove = vi.fn(async () => {});
    await expect(
      applyIntent(BULK, {
        confirmed: false,
        onNavigate: vi.fn(),
        onBulkApprove,
        approvableIds: ['L-1', 'L-5'],
      }),
    ).rejects.toThrow(/onay/i);
    expect(onBulkApprove).not.toHaveBeenCalled();
  });

  it('applies ONLY the pre-selected AI-OK ids when confirmed', async () => {
    const approved: string[] = [];
    const onBulkApprove = vi.fn(async (ids: string[]) => {
      approved.push(...ids);
    });
    const approvableIds = selectApprovable(ROWS).map((r) => r.id);
    const res = await applyIntent(BULK, {
      confirmed: true,
      onNavigate: vi.fn(),
      onBulkApprove,
      approvableIds,
    });
    expect(res).toEqual({ kind: 'approved', ids: ['L-1', 'L-5'] });
    expect(approved).toEqual(['L-1', 'L-5']);
    // uncertain (L-2) and nok (L-3) are NEVER auto-approved.
    expect(approved).not.toContain('L-2');
    expect(approved).not.toContain('L-3');
  });
});
