import type { DopingPackage, Payment } from '../schemas/promotion';

// Reuse the seeded-client + memory-router harness from the listings vertical.
export { renderPage, makeSeededClient } from '@/features/listings/pages/page-story-utils';
// Reuse the deterministic error-state seeder (added in the messages vertical, Task 010).
export { seedQueryError } from '@/features/messages/pages/page-story-utils';

export const MOCK_PACKAGES: DopingPackage[] = [
  { id: 'PKG-1', name: 'Öne Çıkar 7 Gün', kind: 'featured', durationDays: 7, price: 149, status: 'active', order: 0 },
  { id: 'PKG-2', name: 'Vitrin 30 Gün', kind: 'showcase', durationDays: 30, price: 499, status: 'active', order: 1 },
  { id: 'PKG-3', name: 'Acil 3 Gün', kind: 'urgent', durationDays: 3, price: 89, status: 'active', order: 2 },
  { id: 'PKG-4', name: 'Üst Sıra 15 Gün', kind: 'top', durationDays: 15, price: 299, status: 'active', order: 3 },
  { id: 'PKG-6', name: 'Vitrin 7 Gün', kind: 'showcase', durationDays: 7, price: 199, status: 'archived', order: 5 },
];

export const MOCK_PAYMENTS: Payment[] = [
  {
    id: 'PAY-5000',
    invoiceNo: 'FT-2026-1000',
    userId: 'U-2001',
    userName: 'İstanbul Kaya Emlak',
    packageId: 'PKG-1',
    packageName: 'Öne Çıkar 7 Gün',
    amount: 149,
    method: 'card',
    status: 'paid',
    createdAt: '2026-07-20T09:15:00.000Z',
    lineItems: [{ label: 'Öne Çıkar 7 Gün', quantity: 1, unitPrice: 149 }],
  },
  {
    id: 'PAY-5001',
    invoiceNo: 'FT-2026-1001',
    userId: 'U-2002',
    userName: 'Mehmet Yılmaz',
    packageId: 'PKG-2',
    packageName: 'Vitrin 30 Gün',
    amount: 499,
    method: 'transfer',
    status: 'partially-refunded',
    createdAt: '2026-07-19T14:40:00.000Z',
    lineItems: [{ label: 'Vitrin 30 Gün', quantity: 1, unitPrice: 499 }],
    refundedAmount: 250,
  },
  {
    id: 'PAY-5002',
    invoiceNo: 'FT-2026-1002',
    userId: 'U-2003',
    userName: 'Ankara Demir Emlak',
    packageId: 'PKG-3',
    packageName: 'Acil 3 Gün',
    amount: 89,
    method: 'wallet',
    status: 'refunded',
    createdAt: '2026-07-18T11:05:00.000Z',
    lineItems: [{ label: 'Acil 3 Gün', quantity: 1, unitPrice: 89 }],
    refundedAmount: 89,
  },
];
