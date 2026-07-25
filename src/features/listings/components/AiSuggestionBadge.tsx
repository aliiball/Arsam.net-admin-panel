import { Bot, CircleCheck, CircleHelp, CircleX } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { AiSuggestion } from '../schemas/listing';

const MAP: Record<AiSuggestion, { label: string; variant: React.ComponentProps<typeof Badge>['variant']; icon: typeof Bot }> = {
  ok: { label: 'AI: OK', variant: 'success', icon: CircleCheck },
  uncertain: { label: 'AI: Belirsiz', variant: 'warning', icon: CircleHelp },
  nok: { label: 'AI: NOK', variant: 'destructive', icon: CircleX },
};

/**
 * AI pre-score badge (proposes; human disposes). Reasons open in a focus-managed
 * Popover on click/tap/Enter — reachable by keyboard AND touch (the old hover-only
 * Tooltip left touch users with no way in). Never uses the `title` attribute.
 */
export function AiSuggestionBadge({ suggestion, reasons = [] }: { suggestion: AiSuggestion; reasons?: string[] }) {
  const { label, variant, icon: Icon } = MAP[suggestion];
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Badge
          asChild
          variant={variant}
          className="focus-visible:ring-ring relative cursor-pointer gap-1 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none after:absolute after:-inset-3 after:content-['']"
          data-entity="listing"
        >
          <button type="button" aria-label={`${label} — gerekçeleri gör`}>
            <Icon className="size-3" aria-hidden="true" />
            {label}
          </button>
        </Badge>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 text-sm">
        <div className="flex items-start gap-2">
          <Bot className="text-muted-foreground mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <p className="mb-1 font-medium">AI gerekçeleri</p>
            <ul className="text-muted-foreground list-inside list-disc space-y-0.5">
              {reasons.length ? (
                reasons.map((r) => <li key={r}>{r}</li>)
              ) : (
                <li>Gerekçe yok</li>
              )}
            </ul>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
