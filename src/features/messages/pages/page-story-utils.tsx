import type { QueryClient } from '@tanstack/react-query';

import type { Report } from '../schemas/report';

// Reuse the seeded-client + memory-router harness from the listings vertical.
export { renderPage, makeSeededClient } from '@/features/listings/pages/page-story-utils';

export const MOCK_REPORTS: Report[] = [
  {
    id: 'R-3000',
    subjectType: 'listing',
    subjectId: 'L-1000',
    subjectLabel: 'Deniz manzaralı 3+1 daire',
    reasonCategory: 'fraud',
    description: 'Kapora talebi ve gerçek dışı fiyatlarla dolandırıcılık şüphesi var.',
    status: 'open',
    priority: 'high',
    reporterName: 'Ahmet Yılmaz',
    createdAt: '2026-07-20T09:15:00.000Z',
  },
  {
    id: 'R-3001',
    subjectType: 'user',
    subjectId: 'U-2001',
    subjectLabel: 'İstanbul Kaya Emlak',
    reasonCategory: 'spam',
    description: 'Aynı içerik defalarca tekrar paylaşılıyor ve alakasız bağlantılar içeriyor.',
    status: 'open',
    priority: 'normal',
    reporterName: 'Ayşe Kaya',
    createdAt: '2026-07-19T14:40:00.000Z',
  },
  {
    id: 'R-3002',
    subjectType: 'message',
    subjectId: 'M-1002',
    subjectLabel: 'Ödeme talebi içeren mesaj',
    reasonCategory: 'inappropriate',
    description: 'İçerik hakaret ve uygunsuz ifadeler barındırıyor.',
    status: 'resolved',
    priority: 'low',
    reporterName: 'Mehmet Demir',
    createdAt: '2026-07-18T11:05:00.000Z',
  },
];

/**
 * Seed a query into a real error state (deterministic, no network) so page
 * `Error` stories render the actual `isError` branch instead of mirroring Empty.
 * The seeded client disables refetchOnMount, so the error state sticks.
 */
export function seedQueryError(qc: QueryClient, queryKey: readonly unknown[]): void {
  const query = qc.getQueryCache().build(qc, { queryKey: [...queryKey] });
  query.setState({
    status: 'error',
    error: new Error('İstek başarısız'),
    fetchStatus: 'idle',
    data: undefined,
  });
}
