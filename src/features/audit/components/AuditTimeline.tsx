import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import type { AuditEntry } from '@/lib/audit';
import { AuditActorBadge } from './AuditActorBadge';
import { auditDiff, auditReason } from '../lib/audit-utils';

export interface AuditTimelineProps {
  entries: AuditEntry[];
  /** Optional formatter for the raw `resource` string (e.g. `listing:L-1`). */
  renderResource?: (resource: string) => ReactNode;
  /** Shown when there are no entries. */
  emptyMessage?: string;
  className?: string;
}

/** Absolute, deterministic timestamp (`2026-07-20 09:15`) — no relative time. */
function formatTs(ts: string): string {
  return ts.slice(0, 16).replace('T', ' ');
}

/**
 * Shared audit trail renderer used by every detail page and the global audit
 * table. Semantic ordered list; actor kind (human vs `ai:*`) is conveyed by the
 * `AuditActorBadge` (icon + label + aria), and each entry surfaces its
 * field-level before -> after diff plus any human-entered reason.
 */
export function AuditTimeline({ entries, renderResource, emptyMessage, className }: AuditTimelineProps) {
  if (entries.length === 0) {
    return <p className="text-muted-foreground text-sm">{emptyMessage ?? 'Henüz denetim kaydı yok.'}</p>;
  }

  return (
    <ol className={cn('space-y-3 text-sm', className)}>
      {entries.map((entry) => {
        const diff = auditDiff(entry.before, entry.after);
        const reason = auditReason(entry);
        return (
          <li key={entry.id} className="flex flex-col gap-1 border-l-2 border-border pl-3">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <AuditActorBadge actor={entry.actor} />
              <span className="font-medium">{entry.action}</span>
              <span className="text-muted-foreground font-mono text-xs">
                {renderResource ? renderResource(entry.resource) : entry.resource}
              </span>
              <time className="text-muted-foreground ml-auto font-mono text-xs tabular-nums" dateTime={entry.ts}>
                <span className="sr-only">Zaman: </span>
                {formatTs(entry.ts)}
              </time>
            </div>
            {diff.length > 0 && (
              <p className="text-muted-foreground text-xs">
                {diff.map((d, i) => (
                  <span key={d.key}>
                    {i > 0 && ', '}
                    <span className="font-medium">{d.key}</span>: {d.before} → {d.after}
                  </span>
                ))}
              </p>
            )}
            {reason && (
              <p className="text-xs">
                <span className="text-muted-foreground">Gerekçe: </span>
                {reason}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
