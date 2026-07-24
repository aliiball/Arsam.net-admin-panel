import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface SpinnerProps extends React.ComponentProps<'span'> {
  /** Accessible label announced to screen readers. */
  label?: string;
}

/** Indeterminate loading spinner with an accessible label. */
function Spinner({ className, label = 'Yükleniyor', ...props }: SpinnerProps) {
  return (
    <span role="status" aria-live="polite" data-slot="spinner" className={cn('inline-flex', className)} {...props}>
      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export { Spinner };
