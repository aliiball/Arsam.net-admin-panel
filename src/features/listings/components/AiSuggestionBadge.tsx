import { Bot, CircleCheck, CircleHelp, CircleX } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { AiSuggestion } from '../schemas/listing';

const MAP: Record<AiSuggestion, { label: string; variant: React.ComponentProps<typeof Badge>['variant']; icon: typeof Bot }> = {
  ok: { label: 'AI: OK', variant: 'success', icon: CircleCheck },
  uncertain: { label: 'AI: Belirsiz', variant: 'warning', icon: CircleHelp },
  nok: { label: 'AI: NOK', variant: 'destructive', icon: CircleX },
};

/** AI pre-score badge (proposes; human disposes). Reasons shown on hover. */
export function AiSuggestionBadge({ suggestion, reasons = [] }: { suggestion: AiSuggestion; reasons?: string[] }) {
  const { label, variant, icon: Icon } = MAP[suggestion];
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>
          <Badge variant={variant} className="gap-1" data-entity="listing">
            <Icon className="size-3" />
            {label}
          </Badge>
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <div className="flex items-start gap-1.5">
          <Bot className="mt-0.5 size-3.5 shrink-0" />
          <ul className="list-inside list-disc">
            {reasons.length ? reasons.map((r) => <li key={r}>{r}</li>) : <li>Gerekçe yok</li>}
          </ul>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
