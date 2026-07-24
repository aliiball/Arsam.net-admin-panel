import { BadgeCheck, Clock, ShieldX, ShieldOff, type LucideIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  VERIFICATION_CHANNELS,
  VERIFICATION_CHANNEL_LABELS,
  VERIFICATION_LABELS,
  type VerificationLevel,
} from '../data/users';
import type { VerificationState } from '../schemas/user';

/** Icon + variant per level. Icon differs so color is never the sole signal. */
const LEVEL: Record<VerificationLevel, { icon: LucideIcon; variant: React.ComponentProps<typeof Badge>['variant'] }> = {
  verified: { icon: BadgeCheck, variant: 'success' },
  pending: { icon: Clock, variant: 'warning' },
  rejected: { icon: ShieldX, variant: 'destructive' },
  none: { icon: ShieldOff, variant: 'outline' },
};

export interface VerificationBadgesProps {
  verification: VerificationState;
  /** Hide channels that are 'none' (e.g. individuals have no office). */
  hideNone?: boolean;
}

/** Identity / office / phone verification badges (label + icon + tooltip). */
export function VerificationBadges({ verification, hideNone = false }: VerificationBadgesProps) {
  const channels = VERIFICATION_CHANNELS.filter((c) => !hideNone || verification[c] !== 'none');
  if (channels.length === 0) {
    return <span className="text-muted-foreground text-xs">—</span>;
  }
  return (
    <div className="flex flex-wrap gap-1.5" role="list" aria-label="Doğrulama durumu">
      {channels.map((channel) => {
        const level = verification[channel];
        const { icon: Icon, variant } = LEVEL[level];
        const fullLabel = `${VERIFICATION_CHANNEL_LABELS[channel]}: ${VERIFICATION_LABELS[level]}`;
        return (
          <Tooltip key={channel}>
            <TooltipTrigger asChild>
              {/* aria-label carries the level so it reaches screen readers even
                  though the visible text is only the channel name (color/icon
                  are never the sole signal). */}
              <Badge variant={variant} role="listitem" className="gap-1" aria-label={fullLabel}>
                <Icon aria-hidden="true" />
                {VERIFICATION_CHANNEL_LABELS[channel]}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>{fullLabel}</TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
