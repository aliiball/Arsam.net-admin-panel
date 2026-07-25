import type { ReactElement, ReactNode } from 'react';
import { ResponsiveContainer } from 'recharts';

import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export interface ChartCardProps {
  title: ReactNode;
  description?: ReactNode;
  /** Trailing header slot (e.g., a filter or legend toggle). */
  action?: ReactNode;
  height?: number;
  className?: string;
  /**
   * Accessible text alternative for the (visual-only) chart. When provided it is
   * rendered `sr-only` and the SVG is hidden from assistive tech, so screen-reader
   * users get a meaningful summary instead of the unlabeled recharts DOM.
   */
  summary?: ReactNode;
  /** A single recharts chart element (BarChart, LineChart, …). */
  children: ReactElement;
}

/** Card shell hosting a responsive recharts chart. Colors use chart-1..5 tokens. */
export function ChartCard({
  title,
  description,
  action,
  height = 260,
  className,
  summary,
  children,
}: ChartCardProps) {
  return (
    <Card className={cn('gap-4', className)} data-slot="chart-card">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {action}
      </CardHeader>
      <CardContent>
        {summary && (
          <p className="sr-only" data-slot="chart-summary">
            {summary}
          </p>
        )}
        <div
          data-slot="chart-viz"
          style={{ height }}
          className="w-full"
          aria-hidden={summary ? true : undefined}
        >
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
