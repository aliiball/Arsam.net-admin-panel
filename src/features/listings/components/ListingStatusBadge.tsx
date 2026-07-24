import { Badge } from '@/components/ui/badge';
import { STATUS_LABELS, type ListingStatus } from '../data/taxonomy';

const VARIANT: Record<ListingStatus, React.ComponentProps<typeof Badge>['variant']> = {
  draft: 'outline',
  pending: 'warning',
  active: 'success',
  expired: 'secondary',
  archived: 'secondary',
  rejected: 'destructive',
};

export function ListingStatusBadge({ status }: { status: ListingStatus }) {
  return <Badge variant={VARIANT[status]}>{STATUS_LABELS[status]}</Badge>;
}
