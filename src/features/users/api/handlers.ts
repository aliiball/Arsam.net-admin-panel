import { http, HttpResponse } from 'msw';

import { API_BASE_URL } from '@/lib/api/client';
import type { Paginated } from '@/lib/api/types';
import { writeAudit } from '@/lib/audit';
import { LOCATIONS } from '@/features/listings/data/taxonomy';
import {
  USER_STATUSES,
  USER_TYPES,
  VERIFICATION_LEVELS,
  type UserStatus,
  type VerificationLevel,
} from '../data/users';
import { computeTrustScore, userActionSchema, type User, type UserActionInput, type VerificationState } from '../schemas/user';

const ilKeys = Object.keys(LOCATIONS);
const FIRST = ['Ahmet', 'Ayşe', 'Mehmet', 'Zeynep', 'Mustafa', 'Elif', 'Can', 'Deniz', 'Burak', 'Selin'];
const LAST = ['Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Aydın', 'Öztürk', 'Arslan'];

function verificationFor(i: number, type: (typeof USER_TYPES)[number]): VerificationState {
  const lv = (n: number): VerificationLevel => VERIFICATION_LEVELS[n % VERIFICATION_LEVELS.length]!;
  return {
    identity: lv(i),
    office: type === 'individual' ? 'none' : lv(i + 1),
    phone: lv(i + 2),
  };
}

function seed(): User[] {
  const rows: User[] = [];
  for (let i = 0; i < 32; i += 1) {
    const type = USER_TYPES[i % USER_TYPES.length]!;
    const status = USER_STATUSES[i % USER_STATUSES.length]!;
    // Vary il per triplet (not per type) so offices/agents/individuals spread
    // across cities instead of locking to one (type period === ilKeys period).
    const il = ilKeys[Math.floor(i / USER_TYPES.length) % ilKeys.length]!;
    const first = FIRST[i % FIRST.length]!;
    const last = LAST[i % LAST.length]!;
    const verification = verificationFor(i, type);
    const listingsCount = type === 'individual' ? i % 4 : 3 + (i % 18);
    const trustScore = computeTrustScore({ status, verification, listingsCount });
    const districts = Object.keys(LOCATIONS[il]!.districts);
    const ilce = districts[i % districts.length]!;

    const name =
      type === 'office'
        ? `${LOCATIONS[il]!.label} ${last} Emlak`
        : `${first} ${last}`;

    rows.push({
      id: `U-${2000 + i}`,
      type,
      name,
      email:
        type === 'office'
          ? `info@${last.toLocaleLowerCase('tr')}emlak.com`
          : `${first.toLocaleLowerCase('tr')}.${last.toLocaleLowerCase('tr')}@ornek.com`,
      phone: `+90 5${(30 + (i % 20)).toString()} ${(100 + i).toString()} ${(1000 + i * 7).toString().slice(0, 4)}`,
      status,
      trustScore,
      verification,
      il,
      listingsCount,
      joinedAt: new Date(2025, i % 12, 1 + (i % 27)).toISOString(),
      lastActiveAt: new Date(2026, 6, 1 + (i % 24)).toISOString(),
      ...(type === 'office'
        ? {
            office: {
              title: name,
              taxId: `${1000000000 + i * 137}`,
              il,
              ilce,
              memberAgents: [`${FIRST[(i + 1) % FIRST.length]} ${LAST[(i + 2) % LAST.length]}`, `${FIRST[(i + 3) % FIRST.length]} ${LAST[(i + 4) % LAST.length]}`],
            },
          }
        : {}),
      ...(type === 'agent' ? { officeName: `${LOCATIONS[il]!.label} ${LAST[(i + 1) % LAST.length]} Emlak` } : {}),
    });
  }
  return rows;
}

let db: User[] = seed();

/** Reset the mock DB (tests). */
export function resetUsersDb() {
  db = seed();
}

/** Current snapshot of the mock DB (read-only). */
export function getUsersSnapshot(): User[] {
  return [...db];
}

function applyQuery(url: URL): Paginated<User> {
  const page = Number(url.searchParams.get('page') ?? '1');
  const pageSize = Number(url.searchParams.get('pageSize') ?? '25');
  const q = url.searchParams.get('q')?.toLocaleLowerCase('tr') ?? '';
  const statuses = url.searchParams.getAll('status');
  const types = url.searchParams.getAll('type');
  const verifications = url.searchParams.getAll('verification');
  const il = url.searchParams.get('il');
  const trustMin = url.searchParams.get('trustMin');
  const trustMax = url.searchParams.get('trustMax');
  const sortRaw = url.searchParams.get('sort');

  let items = db.filter((u) => {
    if (q && !u.name.toLocaleLowerCase('tr').includes(q) && !u.email.toLocaleLowerCase('tr').includes(q)) return false;
    if (statuses.length && !statuses.includes(u.status)) return false;
    if (types.length && !types.includes(u.type)) return false;
    if (verifications.length && !verifications.includes(u.verification.identity)) return false;
    if (il && u.il !== il) return false;
    if (trustMin && u.trustScore < Number(trustMin)) return false;
    if (trustMax && u.trustScore > Number(trustMax)) return false;
    return true;
  });

  if (sortRaw) {
    const [field, dir] = sortRaw.split(',')[0]!.split(':');
    items = [...items].sort((a, b) => {
      const av = a[field as keyof User] as string | number;
      const bv = b[field as keyof User] as string | number;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return dir === 'desc' ? -cmp : cmp;
    });
  }

  const total = items.length;
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total, page, pageSize };
}

/** Apply a lifecycle action, returning the updated user (status + verification). */
function applyAction(before: User, input: UserActionInput): User {
  switch (input.action) {
    case 'verify': {
      const verification: VerificationState = {
        identity: 'verified',
        office: before.type === 'individual' ? before.verification.office : 'verified',
        phone: before.verification.phone === 'none' ? before.verification.phone : 'verified',
      };
      const status: UserStatus = before.status === 'pending' ? 'active' : before.status;
      return { ...before, verification, status, trustScore: computeTrustScore({ ...before, verification, status }) };
    }
    case 'suspend':
      return { ...before, status: 'suspended', trustScore: computeTrustScore({ ...before, status: 'suspended' }) };
    case 'ban':
      return { ...before, status: 'banned', trustScore: computeTrustScore({ ...before, status: 'banned' }) };
    case 'unban':
      return { ...before, status: 'active', trustScore: computeTrustScore({ ...before, status: 'active' }) };
    default:
      return before;
  }
}

export const usersHandlers = [
  http.get(`${API_BASE_URL}/users`, ({ request }) => HttpResponse.json(applyQuery(new URL(request.url)))),

  http.get(`${API_BASE_URL}/users/:id`, ({ params }) => {
    const user = db.find((u) => u.id === params.id);
    return user ? HttpResponse.json(user) : new HttpResponse(null, { status: 404 });
  }),

  http.post(`${API_BASE_URL}/users/:id/action`, async ({ params, request }) => {
    const idx = db.findIndex((u) => u.id === params.id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const parsed = userActionSchema.safeParse(await request.json());
    if (!parsed.success) {
      return HttpResponse.json({ error: parsed.error.issues[0]?.message ?? 'Geçersiz istek' }, { status: 422 });
    }
    const input = parsed.data;
    const before = db[idx]!;
    const after = applyAction(before, input);
    db[idx] = after;
    writeAudit({
      actor: 'user:current',
      action: `user.${input.action}`,
      resource: `user:${before.id}`,
      before: { status: before.status, verification: before.verification },
      after: { status: after.status, verification: after.verification, reason: input.reason },
    });
    return HttpResponse.json(after);
  }),
];
