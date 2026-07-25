import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { getAuditFor } from '@/lib/audit';
import { AuditTimeline } from '@/features/audit';
import { Can } from '@/lib/permissions/permission-context';
import { PAYMENT_METHOD_LABELS } from '../data/promotions';
import { usePayment } from '../api/queries';
import { useRefundPayment } from '../api/mutations';
import { PaymentStatusBadge } from '../components/PaymentStatusBadge';
import { PaymentMethodBadge } from '../components/PaymentMethodBadge';
import { RefundDialog } from '../components/RefundDialog';
import { formatTry, isRefundable, remainingAmount } from '../schemas/promotion';

export function PaymentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: payment, isLoading, isError, refetch } = usePayment(id);
  const refund = useRefundPayment(id ?? '');

  if (isLoading) return <LoadingState label="Ödeme yükleniyor…" />;
  if (isError || !payment) return <ErrorState title="Ödeme bulunamadı" onRetry={() => void refetch()} />;

  const audit = getAuditFor(`payment:${payment.id}`);
  const remaining = remainingAmount(payment);
  const refundable = isRefundable(payment);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to="/promotions/payments" data-action="navigate" data-entity="payment">
            <ArrowLeft className="size-4" /> Ödemeler
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-xl tabular-nums">{payment.invoiceNo}</CardTitle>
              <CardDescription>
                {payment.userName} · {payment.packageName}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <PaymentMethodBadge method={payment.method} />
              <PaymentStatusBadge status={payment.status} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:grid-cols-4">
            <Field label="Fatura No" value={payment.invoiceNo} />
            <Field label="Yöntem" value={PAYMENT_METHOD_LABELS[payment.method]} />
            <Field label="Tarih" value={new Date(payment.createdAt).toLocaleString('tr-TR')} />
            <div>
              <dt className="text-muted-foreground text-xs">Kullanıcı</dt>
              <dd className="mt-0.5">
                <Link
                  to={`/users/${payment.userId}`}
                  className="text-primary hover:underline"
                  data-action="open-subject"
                  data-entity="payment"
                >
                  {payment.userName}
                </Link>
              </dd>
            </div>
          </dl>

          <Separator />

          <div className="space-y-2">
            <span className="text-muted-foreground text-xs">Satır kalemleri</span>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-border border-b text-left text-xs">
                  <th className="py-1 font-medium">Kalem</th>
                  <th className="py-1 text-right font-medium">Adet</th>
                  <th className="py-1 text-right font-medium">Birim</th>
                  <th className="py-1 text-right font-medium">Tutar</th>
                </tr>
              </thead>
              <tbody>
                {payment.lineItems.map((li, i) => (
                  <tr key={i} className="border-border/60 border-b last:border-0">
                    <td className="py-1.5">{li.label}</td>
                    <td className="py-1.5 text-right tabular-nums">{li.quantity}</td>
                    <td className="py-1.5 text-right tabular-nums">{formatTry(li.unitPrice)}</td>
                    <td className="py-1.5 text-right tabular-nums">{formatTry(li.quantity * li.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-medium">
                  <td className="pt-2" colSpan={3}>
                    Toplam
                  </td>
                  <td className="pt-2 text-right tabular-nums">{formatTry(payment.amount)}</td>
                </tr>
                {payment.refundedAmount ? (
                  <>
                    <tr className="text-muted-foreground">
                      <td colSpan={3}>İade edilen</td>
                      <td className="text-right tabular-nums">− {formatTry(payment.refundedAmount)}</td>
                    </tr>
                    <tr className="font-medium">
                      <td colSpan={3}>Kalan</td>
                      <td className="text-right tabular-nums">{formatTry(remaining)}</td>
                    </tr>
                  </>
                ) : null}
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">İade</CardTitle>
          <CardDescription>
            İade tam veya kısmi olabilir; gerekçe zorunludur ve her iade denetim kaydına yazılır.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {refundable ? (
            <Can
              permission="payment.refund"
              fallback={<p className="text-muted-foreground text-sm">İade için yetkiniz yok.</p>}
            >
              <RefundDialog
                remaining={remaining}
                disabled={refund.isPending}
                onConfirm={async (input) => {
                  await refund.mutateAsync(input);
                }}
              />
            </Can>
          ) : (
            <p className="text-muted-foreground text-sm">Bu ödeme için iade yapılamaz.</p>
          )}

          {audit.length > 0 && (
            <>
              <Separator />
              <AuditTimeline entries={audit} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | undefined }) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="tabular-nums">{value ?? '—'}</dd>
    </div>
  );
}
