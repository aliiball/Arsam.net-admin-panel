import { Badge } from '@/components/ui/badge';
import { PACKAGE_KIND_ICONS, PACKAGE_KIND_LABELS, type PackageKind } from '../data/promotions';

const VARIANT: Record<PackageKind, React.ComponentProps<typeof Badge>['variant']> = {
  featured: 'default',
  showcase: 'secondary',
  urgent: 'destructive',
  top: 'outline',
};

/** Icon + label + aria-label so the package kind is never signalled by color alone. */
export function PackageKindBadge({ kind }: { kind: PackageKind }) {
  const Icon = PACKAGE_KIND_ICONS[kind];
  return (
    <Badge variant={VARIANT[kind]} aria-label={`Tür: ${PACKAGE_KIND_LABELS[kind]}`}>
      <Icon aria-hidden="true" />
      {PACKAGE_KIND_LABELS[kind]}
    </Badge>
  );
}
