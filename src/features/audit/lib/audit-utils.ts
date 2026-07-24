import type { AuditEntry } from '@/lib/audit';
import type { SortSpec } from '@/lib/api/types';
import { ACTION_FAMILIES, type ActionFamily, type ActorKind } from '../data/audit';

/** `ai:<agent>` actors are automated; everything else is a human operator. */
export function actorKind(actor: string): ActorKind {
  return actor.startsWith('ai:') ? 'ai' : 'human';
}

/**
 * Action family = the segment before the first dot. `attribute.*` writes are
 * part of the category vertical, so they map to `category`; anything unknown
 * falls back to its own raw prefix.
 */
export function actionFamily(action: string): string {
  const prefix = action.split('.')[0] ?? '';
  if (prefix === 'attribute') return 'category';
  return prefix;
}

/** Known families only (used to build the facet). */
export function isKnownFamily(value: string): value is ActionFamily {
  return (ACTION_FAMILIES as readonly string[]).includes(value);
}

function reasonFrom(snapshot: unknown): string | undefined {
  if (snapshot && typeof snapshot === 'object' && 'reason' in snapshot) {
    const reason = (snapshot as Record<string, unknown>).reason;
    if (typeof reason === 'string' && reason.trim()) return reason;
  }
  return undefined;
}

/** Human-entered reason, pulled from the after/before snapshot if present. */
export function auditReason(entry: AuditEntry): string | undefined {
  return reasonFrom(entry.after) ?? reasonFrom(entry.before);
}

export interface AuditDiff {
  key: string;
  before: string;
  after: string;
}

function scalar(value: unknown): string {
  if (value === undefined || value === null) return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

/**
 * Field-level before -> after changes. Keys come from the `after` snapshot
 * (excluding `reason`, which is surfaced separately); paired with `before`.
 */
export function auditDiff(before: unknown, after: unknown): AuditDiff[] {
  if (!after || typeof after !== 'object') return [];
  const beforeObj = before && typeof before === 'object' ? (before as Record<string, unknown>) : {};
  const afterObj = after as Record<string, unknown>;
  const changes: AuditDiff[] = [];
  for (const key of Object.keys(afterObj)) {
    if (key === 'reason') continue;
    const b = scalar(beforeObj[key]);
    const a = scalar(afterObj[key]);
    if (b === a) continue;
    changes.push({ key, before: b, after: a });
  }
  return changes;
}

export interface AuditFilter {
  q?: string;
  families?: string[];
  actorKinds?: string[];
  from?: string | null;
  to?: string | null;
  sort?: SortSpec[];
}

/**
 * PURE filter + sort over a fixed set of audit entries — no global state, so it
 * is deterministically unit-testable (the live handler reads `getAuditLog()`,
 * which other verticals mutate at runtime).
 */
export function filterAuditEntries(entries: AuditEntry[], filter: AuditFilter): AuditEntry[] {
  const q = filter.q?.toLocaleLowerCase('tr').trim();
  const items = entries.filter((entry) => {
    if (filter.families?.length && !filter.families.includes(actionFamily(entry.action))) return false;
    if (filter.actorKinds?.length && !filter.actorKinds.includes(actorKind(entry.actor))) return false;
    if (filter.from && entry.ts < filter.from) return false;
    if (filter.to && entry.ts > `${filter.to}T23:59:59.999Z`) return false;
    if (q) {
      const haystack = `${entry.resource} ${entry.action} ${entry.actor} ${auditReason(entry) ?? ''}`.toLocaleLowerCase('tr');
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const sort = filter.sort?.[0];
  if (sort) {
    const field = sort.id as keyof AuditEntry;
    return [...items].sort((a, b) => {
      const av = String(a[field] ?? '');
      const bv = String(b[field] ?? '');
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sort.desc ? -cmp : cmp;
    });
  }
  // Default: newest first.
  return [...items].sort((a, b) => (a.ts < b.ts ? 1 : a.ts > b.ts ? -1 : 0));
}
