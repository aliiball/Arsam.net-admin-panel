import type { ReactNode } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export interface LineChartPoint {
  date: string;
  value: number;
}

export interface LineChartCardProps {
  title: ReactNode;
  description?: ReactNode;
  /** Trailing header slot (e.g., an export menu). */
  action?: ReactNode;
  data: LineChartPoint[];
  /** `line` for counts, `area` for cumulative/amount trends. */
  variant?: 'line' | 'area';
  /** Accessible series name (tooltip + sr-only summary). */
  valueName?: string;
  /** Formats the value for tooltip + sr-only table (defaults to the raw number). */
  valueFormatter?: (value: number) => string;
  /** Formats the axis/summary date label (defaults to the `MM-DD` tail). */
  dateFormatter?: (date: string) => string;
  /** Chart palette token index (1..5). */
  colorToken?: 1 | 2 | 3 | 4 | 5;
  height?: number;
  className?: string;
  loading?: boolean;
}

const defaultDate = (date: string): string => date.slice(5);

/**
 * A responsive line/area trend in a Card. Color is never the sole signal: the
 * series carries a name, and an always-present `sr-only` table restates every
 * point for assistive tech. Token-only colors, loading + empty branches.
 */
export function LineChartCard({
  title,
  description,
  action,
  data,
  variant = 'line',
  valueName = 'Değer',
  valueFormatter,
  dateFormatter = defaultDate,
  colorToken = 1,
  height = 260,
  className,
  loading = false,
}: LineChartCardProps) {
  const format = valueFormatter ?? ((v: number) => String(v));
  const color = `var(--color-chart-${colorToken})`;
  const isEmpty = data.length === 0 || data.every((p) => p.value === 0);

  return (
    <Card className={cn('gap-4', className)} data-slot="line-chart-card" data-entity="report">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-base">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {action}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div style={{ height }} className="bg-muted w-full animate-pulse rounded" />
        ) : isEmpty ? (
          <div
            style={{ height }}
            className="text-muted-foreground flex items-center justify-center text-sm"
          >
            Görüntülenecek veri yok.
          </div>
        ) : (
          <>
            <div style={{ height }} className="w-full">
              <ResponsiveContainer width="100%" height="100%">
                {variant === 'area' ? (
                  <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`fill-${colorToken}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="date" tickFormatter={(v) => dateFormatter(String(v))} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} tickLine={false} axisLine={false} minTickGap={24} />
                    <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} tickLine={false} axisLine={false} width={48} tickFormatter={(v) => format(Number(v))} />
                    <Tooltip
                      formatter={(value) => [format(Number(value)), valueName]}
                      labelFormatter={(label) => dateFormatter(String(label))}
                      contentStyle={{
                        background: 'var(--popover)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        color: 'var(--popover-foreground)',
                        fontSize: 12,
                      }}
                    />
                    <Area type="monotone" dataKey="value" name={valueName} stroke={color} strokeWidth={2} fill={`url(#fill-${colorToken})`} isAnimationActive={false} />
                  </AreaChart>
                ) : (
                  <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="date" tickFormatter={(v) => dateFormatter(String(v))} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} tickLine={false} axisLine={false} minTickGap={24} />
                    <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} tickLine={false} axisLine={false} width={40} tickFormatter={(v) => format(Number(v))} allowDecimals={false} />
                    <Tooltip
                      formatter={(value) => [format(Number(value)), valueName]}
                      labelFormatter={(label) => dateFormatter(String(label))}
                      contentStyle={{
                        background: 'var(--popover)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        color: 'var(--popover-foreground)',
                        fontSize: 12,
                      }}
                    />
                    <Line type="monotone" dataKey="value" name={valueName} stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Accessible alternative: the same series as a table for screen readers. */}
            <table className="sr-only">
              <caption>{typeof title === 'string' ? title : valueName} — günlük veri özeti</caption>
              <thead>
                <tr>
                  <th scope="col">Tarih</th>
                  <th scope="col">{valueName}</th>
                </tr>
              </thead>
              <tbody>
                {data.map((point) => (
                  <tr key={point.date}>
                    <td>{point.date}</td>
                    <td>{format(point.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </CardContent>
    </Card>
  );
}
