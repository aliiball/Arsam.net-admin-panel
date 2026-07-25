import type { ReactNode } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export interface DonutSlice {
  name: string;
  value: number;
}

export interface DonutChartCardProps {
  title: ReactNode;
  description?: ReactNode;
  data: DonutSlice[];
  /** Label under the center total (e.g. "ilan"). */
  centerLabel?: string;
  height?: number;
  className?: string;
}

/** Chart palette tokens, cycled across slices. */
const CHART_TOKENS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
];

/** Cyclic, always-defined token accessor (satisfies noUncheckedIndexedAccess). */
function tokenAt(i: number): string {
  return CHART_TOKENS[i % CHART_TOKENS.length] ?? CHART_TOKENS[0]!;
}

/** Donut chart in a Card, with a center total and a token-colored legend. */
export function DonutChartCard({
  title,
  description,
  data,
  centerLabel,
  height = 260,
  className,
}: DonutChartCardProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const isEmpty = total === 0;

  return (
    <Card className={cn('gap-4', className)} data-slot="donut-chart-card">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div
            style={{ height }}
            className="text-muted-foreground flex items-center justify-center text-sm"
          >
            Görüntülenecek veri yok.
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 md:flex-row">
            <div className="relative" style={{ height, width: height }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="62%"
                    outerRadius="90%"
                    paddingAngle={2}
                    stroke="var(--background)"
                    strokeWidth={2}
                    isAnimationActive={false}
                  >
                    {data.map((slice, i) => (
                      <Cell key={slice.name} fill={tokenAt(i)} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--popover)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      color: 'var(--popover-foreground)',
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center total overlay */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-semibold tabular-nums">{total}</span>
                {centerLabel && (
                  <span className="text-muted-foreground text-xs">{centerLabel}</span>
                )}
              </div>
            </div>

            {/* Token-colored legend (color is never the sole signal — label + value). */}
            <ul className="w-full min-w-0 flex-1 space-y-1.5 text-sm">
              {data.map((slice, i) => (
                <li key={slice.name} className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ background: tokenAt(i) }}
                  />
                  <span className="min-w-0 flex-1 truncate">{slice.name}</span>
                  <span className="text-muted-foreground tabular-nums">{slice.value}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
