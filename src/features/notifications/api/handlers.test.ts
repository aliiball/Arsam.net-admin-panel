import { describe, expect, it } from 'vitest';

import { api } from '@/lib/api/client';
import { getListingsSnapshot } from '@/features/listings/api/handlers';
import type { NotificationsPayload } from '../data/notifications';

describe('notifications handler', () => {
  it('derives the payload from the live listings mock DB (no new source of truth)', async () => {
    const payload = await api.get<NotificationsPayload>('/notifications');
    const pending = getListingsSnapshot().filter((l) => l.status === 'pending').length;

    expect(payload.unread).toBe(pending);
    if (pending > 0) {
      const moderation = payload.items.find((i) => i.kind === 'moderation');
      expect(moderation?.to).toBe('/listings/moderation');
      expect(moderation?.title).toContain('moderasyon bekliyor');
    }
    // Items expose a deep link + timestamp for every entry.
    for (const item of payload.items) {
      expect(item.to.startsWith('/')).toBe(true);
      expect(typeof item.ts).toBe('string');
    }
  });
});
