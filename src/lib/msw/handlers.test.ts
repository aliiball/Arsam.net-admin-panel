import { describe, expect, it } from 'vitest';

import { api } from '@/lib/api/client';
import type { Paginated } from '@/lib/api/types';
import type { PingItem } from './handlers';

describe('MSW demo handler (resource contract)', () => {
  it('returns the paginated envelope', async () => {
    const res = await api.get<Paginated<PingItem>>(
      '/ping',
      new URLSearchParams({ page: '1', pageSize: '5' }),
    );
    expect(res.total).toBe(42);
    expect(res.page).toBe(1);
    expect(res.pageSize).toBe(5);
    expect(res.items).toHaveLength(5);
    expect(res.items[0]).toMatchObject({ id: 'demo-1', label: 'Öğe 1' });
  });

  it('paginates by page/pageSize', async () => {
    const res = await api.list<PingItem>('ping', { page: 2, pageSize: 10 });
    expect(res.items).toHaveLength(10);
    expect(res.items[0]?.id).toBe('demo-11');
  });
});
