import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { api } from '@/lib/api/client';
import { packageKeys, paymentKeys } from './queries';
import { refundOutcome, type DopingPackage, type Payment, type RefundActionInput } from '../schemas/promotion';

/** Create or update a package's meta. `id` present → PATCH, else create. */
export function useUpsertPackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id?: string; values: unknown }) =>
      id ? api.patch<DopingPackage>(`/packages/${id}`, values) : api.post<DopingPackage>('/packages', values),
    onSuccess: (data, vars) => {
      qc.setQueryData(packageKeys.detail(data.id), data);
      void qc.invalidateQueries({ queryKey: packageKeys.all });
      toast.success(vars.id ? 'Paket güncellendi.' : 'Paket oluşturuldu.');
    },
    onError: () => toast.error('Paket kaydedilemedi.'),
  });
}

/** Archive a package (PATCH with status='archived'); emits a package.archive audit entry. */
export function useArchivePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pkg: DopingPackage) =>
      api.patch<DopingPackage>(`/packages/${pkg.id}`, {
        name: pkg.name,
        kind: pkg.kind,
        durationDays: String(pkg.durationDays),
        price: String(pkg.price),
        status: 'archived',
      }),
    onSuccess: (data) => {
      qc.setQueryData(packageKeys.detail(data.id), data);
      void qc.invalidateQueries({ queryKey: packageKeys.all });
    },
    onError: () => toast.error('Paket arşivlenemedi.'),
  });
}

/**
 * Optimistic refund: flips the detail cache to the projected refunded /
 * partially-refunded status, rolls back on error, toasts on both outcomes.
 */
export function useRefundPayment(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RefundActionInput) => api.post<Payment>(`/payments/${id}/refund`, input),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: paymentKeys.detail(id) });
      const previous = qc.getQueryData<Payment>(paymentKeys.detail(id));
      if (previous) {
        const outcome = refundOutcome(previous, input.amount);
        qc.setQueryData<Payment>(paymentKeys.detail(id), {
          ...previous,
          status: outcome.status,
          refundedAmount: outcome.refundedAmount,
        });
      }
      return { previous };
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.previous) qc.setQueryData(paymentKeys.detail(id), ctx.previous);
      toast.error('İade başarısız. Değişiklik geri alındı.');
    },
    onSuccess: (data) => {
      toast.success(data.status === 'refunded' ? 'Ödeme tamamen iade edildi.' : 'Kısmi iade uygulandı.');
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: paymentKeys.all });
    },
  });
}
