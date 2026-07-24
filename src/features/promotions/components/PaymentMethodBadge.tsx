import { Badge } from '@/components/ui/badge';
import { PAYMENT_METHOD_ICONS, PAYMENT_METHOD_LABELS, type PaymentMethod } from '../data/promotions';

/** Icon + label + aria-label so the payment method is never signalled by color alone. */
export function PaymentMethodBadge({ method }: { method: PaymentMethod }) {
  const Icon = PAYMENT_METHOD_ICONS[method];
  return (
    <Badge variant="outline" aria-label={`Yöntem: ${PAYMENT_METHOD_LABELS[method]}`}>
      <Icon aria-hidden="true" />
      {PAYMENT_METHOD_LABELS[method]}
    </Badge>
  );
}
