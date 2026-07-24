import { ChevronUp, Minus, ChevronDown } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { REPORT_PRIORITY_LABELS, type ReportPriority } from '../data/reports';

const META: Record<ReportPriority, { icon: typeof Minus; variant: React.ComponentProps<typeof Badge>['variant'] }> = {
  high: { icon: ChevronUp, variant: 'destructive' },
  normal: { icon: Minus, variant: 'secondary' },
  low: { icon: ChevronDown, variant: 'outline' },
};

/** Icon + label + aria-label so priority is never signalled by color alone. */
export function ReportPriorityBadge({ priority }: { priority: ReportPriority }) {
  const { icon: Icon, variant } = META[priority];
  return (
    <Badge variant={variant} aria-label={`Öncelik: ${REPORT_PRIORITY_LABELS[priority]}`}>
      <Icon aria-hidden="true" />
      {REPORT_PRIORITY_LABELS[priority]}
    </Badge>
  );
}
