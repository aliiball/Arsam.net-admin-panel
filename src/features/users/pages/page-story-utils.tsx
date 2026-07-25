import { computeTrustScore, type User } from '../schemas/user';

// Reuse the seeded-client + memory-router harness from the listings vertical.
export { renderPage, makeSeededClient, seedQueryError } from '@/features/listings/pages/page-story-utils';

function withTrust(u: Omit<User, 'trustScore'>): User {
  return { ...u, trustScore: computeTrustScore(u) };
}

export const MOCK_USERS: User[] = [
  withTrust({
    id: 'U-2000',
    type: 'office',
    name: 'İstanbul Kaya Emlak',
    email: 'info@kayaemlak.com',
    phone: '+90 532 111 2233',
    status: 'active',
    verification: { identity: 'verified', office: 'verified', phone: 'verified' },
    il: '34',
    listingsCount: 18,
    joinedAt: '2025-02-10T00:00:00.000Z',
    lastActiveAt: '2026-07-20T00:00:00.000Z',
    office: {
      title: 'İstanbul Kaya Emlak',
      taxId: '1234567890',
      il: '34',
      ilce: 'kadikoy',
      memberAgents: ['Ayşe Demir', 'Can Şahin'],
    },
  }),
  withTrust({
    id: 'U-2001',
    type: 'agent',
    name: 'Mehmet Yılmaz',
    email: 'mehmet.yilmaz@ornek.com',
    phone: '+90 533 222 3344',
    status: 'pending',
    verification: { identity: 'pending', office: 'none', phone: 'verified' },
    il: '06',
    listingsCount: 4,
    joinedAt: '2026-01-05T00:00:00.000Z',
    lastActiveAt: '2026-07-18T00:00:00.000Z',
    officeName: 'Ankara Demir Emlak',
  }),
  withTrust({
    id: 'U-2002',
    type: 'individual',
    name: 'Zeynep Çelik',
    email: 'zeynep.celik@ornek.com',
    phone: '+90 534 333 4455',
    status: 'suspended',
    verification: { identity: 'rejected', office: 'none', phone: 'none' },
    il: '35',
    listingsCount: 1,
    joinedAt: '2025-11-20T00:00:00.000Z',
    lastActiveAt: '2026-06-30T00:00:00.000Z',
  }),
];
