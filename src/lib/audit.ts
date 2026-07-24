/** Immutable audit log (in-memory mock; FastAPI later). */
export interface AuditEntry {
  id: string;
  actor: string; // user id or `ai:<agent>`
  action: string; // e.g. listing.approve
  resource: string; // e.g. listing:L-1001
  before?: unknown;
  after?: unknown;
  ts: string; // ISO
}

const log: AuditEntry[] = [];
let seq = 0;

export function writeAudit(entry: Omit<AuditEntry, 'id' | 'ts'> & { ts?: string }): AuditEntry {
  seq += 1;
  const full: AuditEntry = {
    id: `audit-${seq}`,
    ts: entry.ts ?? new Date().toISOString(),
    actor: entry.actor,
    action: entry.action,
    resource: entry.resource,
    before: entry.before,
    after: entry.after,
  };
  log.unshift(full);
  return full;
}

export function getAuditLog(): AuditEntry[] {
  return [...log];
}

export function getAuditFor(resource: string): AuditEntry[] {
  return log.filter((e) => e.resource === resource);
}
