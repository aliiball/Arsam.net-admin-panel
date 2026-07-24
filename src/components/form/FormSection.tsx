import * as React from 'react';

import { cn } from '@/lib/utils';

export interface FormSectionProps extends Omit<React.ComponentProps<'section'>, 'title'> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Trailing slot in the header (e.g., an action button). */
  action?: React.ReactNode;
}

/** Groups related fields with an optional heading + description. Single-column. */
export function FormSection({
  title,
  description,
  action,
  className,
  children,
  ...props
}: FormSectionProps) {
  return (
    <section data-slot="form-section" className={cn('space-y-4', className)} {...props}>
      {(title || description || action) && (
        <header className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            {title && <h3 className="text-sm font-semibold text-foreground">{title}</h3>}
            {description && <p className="text-muted-foreground text-sm">{description}</p>}
          </div>
          {action}
        </header>
      )}
      <div className="grid gap-4">{children}</div>
    </section>
  );
}
