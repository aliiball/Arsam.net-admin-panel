import { AlignJustify, Rows3 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useLayout } from '@/lib/layout/layout-context';

/** Toggle comfortable / compact row density. */
export function DensityToggle() {
  const { config, toggleDensity } = useLayout();
  const isCompact = config.density === 'compact';
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDensity}
          aria-label={isCompact ? 'Rahat yoğunluğa geç' : 'Sıkışık yoğunluğa geç'}
          aria-pressed={isCompact}
          data-action="toggle-density"
          data-entity="layout"
        >
          {isCompact ? <Rows3 className="size-4" /> : <AlignJustify className="size-4" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>Yoğunluk: {isCompact ? 'Sıkışık' : 'Rahat'}</TooltipContent>
    </Tooltip>
  );
}
