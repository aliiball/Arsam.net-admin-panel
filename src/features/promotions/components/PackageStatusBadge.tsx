import { Badge } from '@/components/ui/badge';
import { PACKAGE_STATUS_LABELS, type PackageStatus } from '../data/promotions';

const VARIANT: Record<PackageStatus, React.ComponentProps<typeof Badge>['variant']> = {
  active: 'success',
  archived: 'secondary',
};

/** Text label carries the meaning; color is a secondary signal. */
export function PackageStatusBadge({ status }: { status: PackageStatus }) {
  return <Badge variant={VARIANT[status]}>{PACKAGE_STATUS_LABELS[status]}</Badge>;
}
