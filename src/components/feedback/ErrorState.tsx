import { AlertTriangle, RefreshCw } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface ErrorStateProps extends React.ComponentProps<'div'> {
  title?: string;
  description?: string;
  /** Retry handler; shows a retry button when provided. */
  onRetry?: () => void;
  retryLabel?: string;
}

/** Error state surfaced for failed loads (4xx/5xx). */
export function ErrorState({
  title = 'Bir şeyler ters gitti',
  description = 'Veri yüklenemedi. Lütfen tekrar deneyin.',
  onRetry,
  retryLabel = 'Tekrar dene',
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      data-slot="error-state"
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-6 py-12 text-center',
        className,
      )}
      {...props}
    >
      <span className="bg-destructive/10 text-destructive flex size-11 items-center justify-center rounded-full">
        <AlertTriangle className="size-5" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      {onRetry && (
        <Button
          variant="outline"
          onClick={onRetry}
          className="min-h-11"
          data-action="retry"
          data-entity="query"
        >
          <RefreshCw className="size-4" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
