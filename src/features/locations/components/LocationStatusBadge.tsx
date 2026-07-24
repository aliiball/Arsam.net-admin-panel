import { Badge } from '@/components/ui/badge';
import { LOCATION_STATUS_LABELS, type LocationStatus } from '../data/locations';

const VARIANT: Record<LocationStatus, React.ComponentProps<typeof Badge>['variant']> = {
  active: 'success',
  archived: 'secondary',
};

/** Status pill for a province or district (label carries meaning, not just color). */
export function LocationStatusBadge({ status }: { status: LocationStatus }) {
  return <Badge variant={VARIANT[status]}>{LOCATION_STATUS_LABELS[status]}</Badge>;
}
