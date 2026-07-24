import { Badge } from '@/components/ui/badge';
import { PAYMENT_STATUS_LABELS, type PaymentStatus } from '../data/promotions';

const VARIANT: Record<PaymentStatus, React.ComponentProps<typeof Badge>['variant']> = {
  paid: 'success',
  refunded: 'secondary',
  'partially-refunded': 'warning',
  failed: 'destructive',
};

/** Text label carries the meaning; color is a secondary signal. */
export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge variant={VARIANT[status]}>{PAYMENT_STATUS_LABELS[status]}</Badge>;
}
