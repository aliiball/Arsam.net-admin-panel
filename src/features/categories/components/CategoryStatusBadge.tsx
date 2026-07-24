import { Badge } from '@/components/ui/badge';
import { CATEGORY_STATUS_LABELS, type CategoryStatus } from '../data/categories';

const VARIANT: Record<CategoryStatus, React.ComponentProps<typeof Badge>['variant']> = {
  active: 'success',
  archived: 'secondary',
};

export function CategoryStatusBadge({ status }: { status: CategoryStatus }) {
  return <Badge variant={VARIANT[status]}>{CATEGORY_STATUS_LABELS[status]}</Badge>;
}
