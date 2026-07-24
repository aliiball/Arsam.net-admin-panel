import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { FieldHelp } from '@/components/form/FieldHelp';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/feedback/EmptyState';
import { FEATURE_FLAGS, type FeatureFlagKey, type FeatureFlagMeta, type FeatureFlags } from '../schemas/settings';

export interface FeatureFlagListProps {
  flags: FeatureFlags;
  onToggle: (key: FeatureFlagKey, value: boolean) => void;
  /** Flag catalog (rows). Defaults to the full known catalog. */
  catalog?: FeatureFlagMeta[];
  /** Skeleton rows while the flags load. */
  loading?: boolean;
  /** Disable every switch (e.g. an in-flight save). */
  disabled?: boolean;
}

/** 44px hit-area wrapper around the (small) switch — WCAG 2.2 target size. */
const SWITCH_HIT = 'inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-end';

/**
 * List of feature flags. Each row is a labelled `Switch` with a `FieldHelp`
 * affordance; the switch state is conveyed by role + label (never color alone),
 * and the touch target is expanded to 44px around the small control.
 */
export function FeatureFlagList({ flags, onToggle, catalog = FEATURE_FLAGS, loading, disabled }: FeatureFlagListProps) {
  if (loading) {
    return (
      <div className="space-y-2" aria-hidden="true">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-full" />
        ))}
      </div>
    );
  }

  if (catalog.length === 0) {
    return <EmptyState title="Bayrak yok" description="Tanımlı özellik bayrağı bulunamadı." />;
  }

  return (
    <ul role="list" className="divide-border divide-y" data-entity="settings">
      {catalog.map((flag) => {
        const labelId = `flag-label-${flag.key}`;
        const checked = flags[flag.key];
        return (
          <li key={flag.key} className="flex items-center justify-between gap-4 py-2">
            <div className="flex items-center gap-1.5">
              <span id={labelId} className="text-sm font-medium">
                {flag.label}
              </span>
              <FieldHelp help={flag.help} label={`${flag.label} hakkında`} />
            </div>
            <label className={cn(SWITCH_HIT, disabled && 'cursor-not-allowed opacity-50')}>
              <Switch
                checked={checked}
                disabled={disabled ?? false}
                onCheckedChange={(v) => onToggle(flag.key, v === true)}
                aria-labelledby={labelId}
                data-action="toggle-flag"
                data-entity="settings"
              />
            </label>
          </li>
        );
      })}
    </ul>
  );
}
