import { Skeleton } from '@/components/ui/skeleton';

/**
 * Suspense fallback for lazily code-split route components. Mirrors a generic
 * page shell (title + toolbar + content block) so the transition reads as a
 * loading page, not a blank flash. Token-only; no layout shift on the shell.
 */
export function PageSkeleton() {
  return (
    <div
      className="space-y-6 p-4 lg:p-6"
      role="status"
      aria-busy="true"
      aria-label="Sayfa yükleniyor"
      data-slot="page-skeleton"
    >
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
      <span className="sr-only">Yükleniyor…</span>
    </div>
  );
}
