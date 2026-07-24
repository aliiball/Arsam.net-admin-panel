import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';

export interface LoadingStateProps extends React.ComponentProps<'div'> {
  label?: string;
}

/** Block-level loading state with an accessible status message. */
export function LoadingState({ label = 'Yükleniyor…', className, ...props }: LoadingStateProps) {
  return (
    <div
      data-slot="loading-state"
      className={cn('flex flex-col items-center justify-center gap-3 px-6 py-12 text-center', className)}
      {...props}
    >
      <Spinner label={label} className="text-muted-foreground [&_svg]:size-6" />
      <p className="text-muted-foreground text-sm">{label}</p>
    </div>
  );
}
