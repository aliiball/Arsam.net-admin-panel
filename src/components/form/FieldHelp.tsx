import type { ReactNode } from 'react';
import { HelpCircle, TriangleAlert } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

/** Expanded 44px touch target around a small icon (WCAG 2.2 target size). */
const HIT_AREA =
  "relative inline-flex size-5 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring after:absolute after:-inset-3 after:content-['']";

export interface FieldHelpProps {
  /** Help content. Shown in a focus-managed popover on click (long content ok). */
  help?: ReactNode;
  /** Caution note shown in a tooltip on hover/focus. */
  warning?: ReactNode;
  /** Accessible label for the help button. */
  label?: string;
  className?: string;
}

/**
 * Icon-only field help affordance. Help opens a focus-managed popover on click;
 * warning shows a tooltip. NEVER uses the `title` attribute.
 */
export function FieldHelp({ help, warning, label = 'Yardım', className }: FieldHelpProps) {
  if (!help && !warning) return null;
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      {help != null && (
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" aria-label={label} className={HIT_AREA} data-action="open-field-help" data-entity="field">
              <HelpCircle className="size-4" aria-hidden="true" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 text-sm" align="start">
            {help}
          </PopoverContent>
        </Popover>
      )}
      {warning != null && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Uyarı"
              className={cn(HIT_AREA, 'text-warning-foreground hover:text-warning-foreground')}
              data-action="show-field-warning"
              data-entity="field"
            >
              <TriangleAlert className="size-4" aria-hidden="true" />
            </button>
          </TooltipTrigger>
          <TooltipContent>{warning}</TooltipContent>
        </Tooltip>
      )}
    </span>
  );
}
