import type { AuditEntry } from '@/lib/audit';
import type { Listing } from '@/features/listings/schemas/listing';

/**
 * Notification derivation — the command dock's bell reads moderation + audit
 * signals that ALREADY exist (no new source of truth). Everything here is PURE
 * so it is deterministically unit-testable; the MSW handler just feeds it the
 * live mock DB (`getListingsSnapshot()` + `getAuditLog()`).
 */

export type NotificationKind = 'moderation' | 'audit';

export interface NotificationItem {
  id: string;
  kind: NotificationKind;
  /** Turkish, human-readable one-liner. */
  title: string;
  /** Secondary detail (resource id / hint). */
  description?: string;
  /** Deep link to the relevant surface. */
  to: string;
  /** ISO timestamp for ordering / display. */
  ts: string;
}

export interface NotificationsPayload {
  items: NotificationItem[];
  /** Actionable count on the bell badge (pending moderation queue size). */
  unread: number;
}

/** Family prefix → its list route (for audit deep links). */
const RESOURCE_ROUTES: Record<string, string> = {
  listing: '/listings',
  user: '/users',
  category: '/categories',
  attribute: '/categories',
  location: '/locations',
  report: '/messages',
  payment: '/promotions/payments',
  package: '/promotions',
  flag: '/settings',
  role: '/rbac',
};

/** Families whose id maps to a real `/base/:id` detail route. */
const DETAIL_FAMILIES = new Set(['listing', 'user', 'category', 'location', 'report']);

/** `listing:L-1001` → `/listings/L-1001`; `flag:x`/`*` → the family list route. */
export function auditResourceRoute(resource: string): string {
  const [family = '', id] = resource.split(':');
  const base = RESOURCE_ROUTES[family] ?? '/audit';
  if (!id || id === '*') return base;
  return DETAIL_FAMILIES.has(family) ? `${base}/${id}` : base;
}

const FAMILY_LABELS: Record<string, string> = {
  listing: 'İlan',
  user: 'Kullanıcı',
  category: 'Kategori',
  attribute: 'Nitelik',
  location: 'Lokasyon',
  report: 'Şikayet',
  payment: 'Ödeme',
  package: 'Doping paketi',
  flag: 'Özellik bayrağı',
  role: 'Rol',
};

const VERB_LABELS: Record<string, string> = {
  create: 'oluşturuldu',
  update: 'güncellendi',
  approve: 'onaylandı',
  reject: 'reddedildi',
  hold: 'beklemeye alındı',
  archive: 'arşivlendi',
  delete: 'silindi',
  reorder: 'yeniden sıralandı',
  verify: 'doğrulandı',
  suspend: 'askıya alındı',
  ban: 'yasaklandı',
  unban: 'yasağı kaldırıldı',
  resolve: 'çözüldü',
  dismiss: 'reddedildi',
  escalate: 'üst kademeye taşındı',
  refund: 'iade edildi',
  enable: 'açıldı',
  disable: 'kapatıldı',
};

/** `listing.approve` → "İlan onaylandı"; unknown parts fall back to the raw token. */
export function formatAuditTitle(action: string): string {
  const [family = '', verb = ''] = action.split('.');
  const familyLabel = FAMILY_LABELS[family] ?? family;
  const verbLabel = VERB_LABELS[verb] ?? verb;
  return `${familyLabel} ${verbLabel}`.trim();
}

/**
 * Build the notification payload from the current listings + audit log.
 * A single moderation-summary item (badge count = its size) plus the most
 * recent audit entries as deep-linkable history.
 */
export function deriveNotifications(
  listings: Listing[],
  audit: AuditEntry[],
  opts: { auditLimit?: number } = {},
): NotificationsPayload {
  const auditLimit = opts.auditLimit ?? 5;
  const pending = listings.filter((l) => l.status === 'pending');
  const items: NotificationItem[] = [];

  if (pending.length > 0) {
    const latest = pending.reduce((a, b) => (a.createdAt > b.createdAt ? a : b));
    items.push({
      id: 'moderation-queue',
      kind: 'moderation',
      title: `${pending.length} ilan moderasyon bekliyor`,
      description: 'Onay kuyruğunu incele',
      to: '/listings/moderation',
      ts: latest.createdAt,
    });
  }

  for (const entry of audit.slice(0, auditLimit)) {
    items.push({
      id: entry.id,
      kind: 'audit',
      title: formatAuditTitle(entry.action),
      description: entry.resource,
      to: auditResourceRoute(entry.resource),
      ts: entry.ts,
    });
  }

  return { items, unread: pending.length };
}
