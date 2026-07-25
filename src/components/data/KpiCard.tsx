import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

export interface KpiCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  /** Signed percentage/absolute change; sign drives the arrow, sign glyph + color. */
  delta?: number;
  deltaSuffix?: string;
  hint?: string;
  /**
   * Optional trend series (oldest → newest). When provided, a compact ~40px
   * sparkline (chart-1 token, no axes) is rendered. Purely decorative — the KPI
   * value + delta carry the meaning — so it is hidden from assistive tech.
   */
  trend?: number[] | undefined;
  /**
   * Reserve the sparkline strip's height while `loading`, so a trend-bearing card
   * doesn't jump ~32px taller when data arrives. Set on cards that will show a
   * sparkline (e.g. the dashboard KPIs); leave off for trend-less cards (Reports).
   */
  reserveSparkline?: boolean;
  loading?: boolean;
  className?: string;
}

/** Compact KPI tile with tabular value, optional trend delta + sparkline. */
export function KpiCard({
  label,
  value,
  icon: Icon,
  delta,
  deltaSuffix = '%',
  hint,
  trend,
  reserveSparkline = false,
  loading = false,
  className,
}: KpiCardProps) {
  const up = (delta ?? 0) >= 0;
  const showSparkline = !loading && !!trend && trend.length > 1;
  const sparkData = showSparkline ? trend.map((v, i) => ({ i, v })) : [];

  return (
    <Card className={cn('gap-0 py-4', className)} data-slot="kpi-card" data-entity="metric">
      <CardContent className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="text-muted-foreground truncate text-sm">{label}</p>
            {loading ? (
              <div className="bg-muted h-7 w-20 animate-pulse rounded" />
            ) : (
              <p className="truncate text-xl font-semibold tabular-nums sm:text-2xl">{value}</p>
            )}
            {delta !== undefined && !loading && (
              <p className="flex flex-wrap items-center gap-1.5 text-xs">
                <span
                  className={cn(
                    // Symmetric tinted pill: tint + arrow direction + sign glyph mean the
                    // trend is never conveyed by color alone (WCAG 1.4.1). Both branches
                    // use a dedicated on-tint text token (…-foreground / …-tint-foreground)
                    // tuned for ≥4.5:1 on its /10 tint — true symmetry, AA-safe (the raw
                    // --destructive only reaches ~4.07:1 as text on its own tint).
                    'inline-flex items-center gap-0.5 rounded px-1 py-0.5 font-medium tabular-nums',
                    up
                      ? 'bg-success/10 text-success-foreground'
                      : 'bg-destructive/10 text-destructive-tint-foreground',
                  )}
                >
                  {up ? (
                    <ArrowUpRight className="size-3.5" aria-hidden="true" />
                  ) : (
                    <ArrowDownRight className="size-3.5" aria-hidden="true" />
                  )}
                  {up ? '+' : '−'}
                  {Math.abs(delta)}
                  {deltaSuffix}
                </span>
                {hint && <span className="text-muted-foreground truncate">{hint}</span>}
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
        </div>
        {/* Reserve the strip height while loading so the card doesn't jump when the
            real sparkline arrives (only for cards that will show one). */}
        {loading && reserveSparkline && (
          <div
            className="bg-muted -mb-1 h-8 w-full animate-pulse rounded"
            data-slot="kpi-sparkline-skeleton"
            aria-hidden="true"
          />
        )}
        {/* Full-width sparkline strip — declutters the right column (icon-only) and
            gives the trend line more horizontal room to read. Decorative → aria-hidden. */}
        {showSparkline && (
          <div className="-mb-1 h-8 w-full" data-slot="kpi-sparkline" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="kpi-spark-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="var(--color-chart-1)"
                  strokeWidth={1.5}
                  fill="url(#kpi-spark-fill)"
                  isAnimationActive={false}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
