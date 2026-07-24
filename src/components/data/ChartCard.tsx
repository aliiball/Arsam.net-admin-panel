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
        <div style={{ height }} className="w-full">
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
