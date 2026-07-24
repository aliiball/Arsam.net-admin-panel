import { Badge } from '@/components/ui/badge';
import { ACTOR_KIND_ICONS, ACTOR_KIND_LABELS } from '../data/audit';
import { actorKind } from '../lib/audit-utils';

/**
 * Distinguishes automated (`ai:<agent>`) actors from humans by icon + label +
 * aria — color/variant is never the sole signal. AI actors show the agent name;
 * humans show the raw actor id.
 */
export function AuditActorBadge({ actor }: { actor: string }) {
  const kind = actorKind(actor);
  const Icon = ACTOR_KIND_ICONS[kind];
  const display = kind === 'ai' ? actor.slice('ai:'.length) : actor;
  return (
    <Badge
      variant={kind === 'ai' ? 'secondary' : 'outline'}
      className="gap-1 font-mono"
      aria-label={`${ACTOR_KIND_LABELS[kind]} aktör: ${actor}`}
    >
      <Icon aria-hidden="true" className="size-3.5" />
      {display}
    </Badge>
  );
}
