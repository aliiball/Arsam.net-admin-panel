import { cn } from '@/lib/utils';
import { TRUST_TIER_LABELS, trustTier, type TrustTier } from '../schemas/user';

/** Token-based fill per tier. Color is never the SOLE signal (value + label shown). */
const TIER_FILL: Record<TrustTier, string> = {
  low: 'bg-destructive',
  medium: 'bg-warning',
  high: 'bg-success',
};

export interface TrustScoreMeterProps {
  score: number;
  /** Compact inline variant (no header row) for dense table cells. */
  compact?: boolean;
  className?: string;
}

/**
 * 0–100 trust meter. Exposes `role="meter"` with aria-value* for assistive
 * tech; renders the numeric value and a tier label so color is never the only
 * signal.
 */
export function TrustScoreMeter({ score, compact = false, className }: TrustScoreMeterProps) {
  const value = Math.max(0, Math.min(100, Math.round(score)));
  const tier = trustTier(value);
  const label = TRUST_TIER_LABELS[tier];

  const bar = (
    <div
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      aria-label={`Güven skoru: ${value} / 100 (${label})`}
      className="bg-muted h-2 w-full overflow-hidden rounded-full"
    >
      <div
        className={cn('h-full rounded-full transition-[width]', TIER_FILL[tier])}
        style={{ width: `${value}%` }}
      />
    </div>
  );

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <span className="w-8 text-right text-sm font-medium tabular-nums">{value}</span>
        <div className="min-w-16 flex-1">{bar}</div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-baseline justify-between">
        <span className="text-muted-foreground text-xs">Güven Skoru</span>
        <span className="text-sm">
          <span className="font-semibold tabular-nums">{value}</span>
          <span className="text-muted-foreground"> / 100 · {label}</span>
        </span>
      </div>
      {bar}
    </div>
  );
}
