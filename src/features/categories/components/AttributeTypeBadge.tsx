import { Hash, Type, List, ToggleLeft } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { ATTRIBUTE_TYPE_LABELS, type AttributeType } from '../data/categories';

const ICON: Record<AttributeType, typeof Hash> = {
  number: Hash,
  text: Type,
  select: List,
  boolean: ToggleLeft,
};

/** Icon + label so the attribute type is never signalled by color alone. */
export function AttributeTypeBadge({ type }: { type: AttributeType }) {
  const Icon = ICON[type];
  return (
    <Badge variant="outline" aria-label={`Alan tipi: ${ATTRIBUTE_TYPE_LABELS[type]}`}>
      <Icon aria-hidden="true" />
      {ATTRIBUTE_TYPE_LABELS[type]}
    </Badge>
  );
}
