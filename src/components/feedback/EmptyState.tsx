import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface EmptyStateProps extends React.ComponentProps<'div'> {
  icon?: LucideIcon;
  title: string;
  description?: string;
  /** Primary next action (e.g., a Button). */
  action?: React.ReactNode;
}

/** Neutral empty-data state with a clear next action. */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      role="status"
      data-slot="empty-state"
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border px-6 py-12 text-center',
        className,
      )}
      {...props}
    >
      <span className="bg-muted text-muted-foreground flex size-11 items-center justify-center rounded-full">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        {description && <p className="text-muted-foreground text-sm">{description}</p>}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
