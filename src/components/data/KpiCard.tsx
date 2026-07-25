import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

export interface KpiCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  /** Signed percentage/absolute change; sign drives the arrow + color. */
  delta?: number;
  deltaSuffix?: string;
  hint?: string;
  loading?: boolean;
  className?: string;
}

/** Compact KPI tile with tabular value + optional trend delta. */
export function KpiCard({
  label,
  value,
  icon: Icon,
  delta,
  deltaSuffix = '%',
  hint,
  loading = false,
  className,
}: KpiCardProps) {
  const up = (delta ?? 0) >= 0;
  return (
    <Card className={cn('gap-0 py-4', className)} data-slot="kpi-card" data-entity="metric">
      <CardContent className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-muted-foreground truncate text-sm">{label}</p>
          {loading ? (
            <div className="bg-muted h-7 w-20 animate-pulse rounded" />
          ) : (
            <p className="truncate text-xl font-semibold tabular-nums sm:text-2xl">{value}</p>
          )}
          {delta !== undefined && !loading && (
            <p
              className={cn(
                'inline-flex items-center gap-0.5 text-xs tabular-nums',
                up ? 'text-success-foreground' : 'text-destructive',
              )}
            >
              {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
              {Math.abs(delta)}
              {deltaSuffix}
              {hint && <span className="text-muted-foreground ml-1">{hint}</span>}
            </p>
          )}
          {delta === undefined && hint && !loading && (
            <p className="text-muted-foreground text-xs">{hint}</p>
          )}
        </div>
        {Icon && (
          <span className="bg-secondary text-secondary-foreground flex size-9 shrink-0 items-center justify-center rounded-md">
            <Icon className="size-4" aria-hidden="true" />
          </span>
        )}
      </CardContent>
    </Card>
  );
}
