import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle, CheckCircle2, Info, TriangleAlert, type LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

const alertVariants = cva(
  'relative flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-sm',
  {
    variants: {
      variant: {
        info: 'border-border bg-card text-card-foreground',
        success: 'border-success/25 bg-success/10 text-success-foreground',
        warning: 'border-warning/30 bg-warning/10 text-warning-foreground',
        destructive: 'border-destructive/30 bg-destructive/5 text-foreground',
      },
    },
    defaultVariants: { variant: 'info' },
  },
);

const ICONS: Record<NonNullable<VariantProps<typeof alertVariants>['variant']>, LucideIcon> = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  destructive: AlertCircle,
};

export interface InlineAlertProps
  extends React.ComponentProps<'div'>,
    VariantProps<typeof alertVariants> {
  title?: string;
  icon?: LucideIcon | false;
}

/** Inline contextual alert. Color is never the sole signal — icon + text carry meaning. */
export function InlineAlert({
  className,
  variant = 'info',
  title,
  icon,
  children,
  ...props
}: InlineAlertProps) {
  const resolvedVariant = variant ?? 'info';
  const Icon = icon === false ? null : (icon ?? ICONS[resolvedVariant]);
  return (
    <div
      role="alert"
      data-slot="inline-alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {Icon && <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />}
      <div className="space-y-0.5">
        {title && <p className="font-medium leading-none">{title}</p>}
        {children && <div className="text-muted-foreground [&_a]:text-foreground [&_a]:underline">{children}</div>}
      </div>
    </div>
  );
}
