import { Ban, ShieldAlert, EyeOff, CircleAlert, Tag } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { REASON_CATEGORY_LABELS, type ReasonCategory } from '../data/reports';

const ICON: Record<ReasonCategory, typeof Ban> = {
  spam: Ban,
  fraud: ShieldAlert,
  inappropriate: EyeOff,
  misinformation: CircleAlert,
  other: Tag,
};

/** Icon + label so the reason category is never signalled by color alone. */
export function ReasonCategoryBadge({ category }: { category: ReasonCategory }) {
  const Icon = ICON[category];
  return (
    <Badge variant="outline" aria-label={`Sebep: ${REASON_CATEGORY_LABELS[category]}`}>
      <Icon aria-hidden="true" />
      {REASON_CATEGORY_LABELS[category]}
    </Badge>
  );
}
