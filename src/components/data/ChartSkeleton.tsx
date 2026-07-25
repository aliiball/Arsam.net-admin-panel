import { Skeleton } from '@/components/ui/skeleton';

/** Deterministic bar heights (percent) — no random, stable across renders. */
const BAR_HEIGHTS = [52, 78, 40, 90, 64, 34, 72];

/**
 * Shape-matched skeleton for a bar chart: a baseline row of skeleton bars at the
 * chart's height, so the loading silhouette reads as a chart rather than a blank
 * block. Decorative — hidden from assistive tech.
 */
export function ChartSkeleton({ height = 260 }: { height?: number }) {
  return (
    <div
      data-slot="chart-skeleton"
      aria-hidden="true"
      style={{ height }}
      className="flex w-full items-end justify-between gap-2 px-1 pb-1"
    >
      {BAR_HEIGHTS.map((h, i) => (
        <Skeleton key={i} className="w-full rounded-sm" style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

/**
 * Shape-matched skeleton for a donut chart: a ring silhouette beside a few legend
 * lines, mirroring `DonutChartCard`'s real layout. Decorative — hidden from AT.
 */
export function DonutSkeleton({ height = 260 }: { height?: number }) {
  return (
    <div
      data-slot="donut-skeleton"
      aria-hidden="true"
      className="flex flex-col items-center gap-4 @[26rem]:flex-row"
    >
      <div className="relative shrink-0" style={{ height, width: height }}>
        {/* Ring: full disc minus a centered hole (matches innerRadius 62%). */}
        <Skeleton className="size-full rounded-full" />
        <div className="bg-card absolute inset-[19%] rounded-full" />
      </div>
      <ul className="w-full min-w-0 flex-1 space-y-2.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <li key={i} className="flex items-center gap-2">
            <Skeleton className="size-2.5 shrink-0 rounded-full" />
            <Skeleton className="h-3 flex-1" />
            <Skeleton className="h-3 w-6" />
          </li>
        ))}
      </ul>
    </div>
  );
}
