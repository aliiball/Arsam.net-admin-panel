import { useMemo } from 'react';
import { Link, useMatches } from 'react-router-dom';
import { Clock } from 'lucide-react';

import { cn } from '@/lib/utils';
import { hasRouteMeta } from '@/app/route-meta';
import { useNow, formatClock } from '@/lib/shell/useNow';

export interface ContextPillProps {
  /** Injected clock for deterministic stories/tests. */
  now?: Date | undefined;
  className?: string;
}

interface Crumb {
  title: string;
  to: string;
}

/**
 * Dock context indicator: "Şu an: [üst ›] <active page>" + a live clock. The
 * trail comes from the matched routes' `handle.routeMeta.title` (same source as
 * the breadcrumbs). On nested routes the parent renders as a link so dock users
 * keep the one-click "up a level" that sidebar/topnav breadcrumbs provide. The
 * clock is injectable for deterministic tests.
 */
export function ContextPill({ now, className }: ContextPillProps) {
  const matches = useMatches();
  const crumbs = useMemo<Crumb[]>(
    () =>
      matches.flatMap((m) =>
        hasRouteMeta(m.handle) ? [{ title: m.handle.routeMeta.title, to: m.pathname }] : [],
      ),
    [matches],
  );

  const current = crumbs[crumbs.length - 1];
  const parent = crumbs.length > 1 ? crumbs[crumbs.length - 2] : undefined;
  const clock = useNow(now);

  return (
    <div
      className={cn('flex min-w-0 items-center gap-2 text-sm', className)}
      data-entity="context"
      data-action="show-context"
    >
      <span className="flex min-w-0 items-center gap-1">
        <span className="text-muted-foreground shrink-0">Şu an: </span>
        {parent && (
          <>
            <Link
              to={parent.to}
              className="text-muted-foreground hover:text-foreground focus-visible:ring-ring hidden max-w-32 shrink truncate rounded outline-none focus-visible:ring-2 md:inline"
              data-action="navigate"
              data-entity="context"
            >
              {parent.title}
            </Link>
            <span className="text-muted-foreground/60 hidden shrink-0 md:inline" aria-hidden>
              ›
            </span>
          </>
        )}
        <span className="min-w-0 truncate font-medium">{current?.title ?? 'Panel'}</span>
      </span>
      <span className="text-muted-foreground/60 shrink-0" aria-hidden>
        •
      </span>
      <span className="text-muted-foreground inline-flex shrink-0 items-center gap-1 tabular-nums">
        <Clock className="size-3.5" aria-hidden />
        <time dateTime={clock.toISOString()}>{formatClock(clock)}</time>
      </span>
    </div>
  );
}
