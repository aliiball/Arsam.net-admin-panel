import * as React from 'react';
import { Link } from 'react-router-dom';

import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

/** A single key/value meta row rendered under the card title. */
export interface MobileListCardMeta {
  label: string;
  value: React.ReactNode;
  /** Span both grid columns (e.g. a wide value like a meter). */
  full?: boolean;
}

export interface MobileListCardProps {
  /** Primary heading (string or node). */
  title: React.ReactNode;
  /** Detail route; when set the title becomes an `open-detail` link. */
  to?: string;
  /** `data-entity` for AI-first tagging on the title link. */
  entity?: string;
  /** Selection state; when `onToggleSelect` is set a 44px checkbox is rendered. */
  selected?: boolean;
  onToggleSelect?: () => void;
  selectLabel?: string;
  /** Status/priority badges shown at the top-right, next to the title. */
  badges?: React.ReactNode;
  /** Key/value meta rows (2-up grid, `full` spans both columns). */
  meta?: MobileListCardMeta[];
  /** Trailing actions (a Detay link, an edit dialog trigger, …). */
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Shared mobile card body for `DataTable.renderMobileCard`. Renders a curated,
 * prioritized card — primary title (optionally a detail link), status badges,
 * a compact 2-up meta grid and optional row actions — instead of the generic
 * `dl/dt/dd` fallback. The checkbox keeps the row selectable so bulk actions
 * still work on phones; it carries a ≥44px hit target from the Checkbox
 * primitive (WCAG 2.5.5). Token-only styling; the card chrome (border/padding)
 * is supplied by DataTable's wrapper.
 */
export function MobileListCard({
  title,
  to,
  entity,
  selected,
  onToggleSelect,
  selectLabel,
  badges,
  meta,
  actions,
  className,
}: MobileListCardProps) {
  const heading = to ? (
    <Link
      to={to}
      className="font-medium hover:underline"
      data-action="open-detail"
      {...(entity ? { 'data-entity': entity } : {})}
    >
      {title}
    </Link>
  ) : (
    <span className="font-medium">{title}</span>
  );

  return (
    <div className={cn('flex items-start gap-4', className)}>
      {onToggleSelect && (
        <Checkbox
          className="mt-1 shrink-0"
          checked={selected ?? false}
          onCheckedChange={() => onToggleSelect()}
          aria-label={selectLabel ?? 'Satırı seç'}
        />
      )}
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 break-words text-sm">{heading}</div>
          {badges && (
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">{badges}</div>
          )}
        </div>
        {meta && meta.length > 0 && (
          <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
            {meta.map((m, i) => (
              <div key={i} className={cn('min-w-0', m.full && 'col-span-2')}>
                <dt className="text-muted-foreground text-xs">{m.label}</dt>
                <dd className={cn(!m.full && 'truncate')}>{m.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
