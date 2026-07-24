import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { api } from '@/lib/api/client';
import { REPORT_ACTION_STATUS, type ReportActionType } from '../data/reports';
import { reportKeys } from './queries';
import type { Report, ReportActionInput } from '../schemas/report';

const ACTION_TOAST: Record<ReportActionType, string> = {
  resolve: 'Şikayet çözüldü olarak işaretlendi.',
  dismiss: 'Şikayet reddedildi.',
  escalate: 'Şikayet üst mercie taşındı.',
};

/**
 * Optimistic complaint moderation (resolve / dismiss / escalate) with rollback
 * + toasts. Mirrors the users lifecycle mutation.
 */
export function useReportAction(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ReportActionInput) => api.post<Report>(`/reports/${id}/action`, input),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: reportKeys.detail(id) });
      const previous = qc.getQueryData<Report>(reportKeys.detail(id));
      if (previous) {
        qc.setQueryData<Report>(reportKeys.detail(id), { ...previous, status: REPORT_ACTION_STATUS[input.action] });
      }
      return { previous };
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.previous) qc.setQueryData(reportKeys.detail(id), ctx.previous);
      toast.error('İşlem başarısız. Değişiklik geri alındı.');
    },
    onSuccess: (_data, input) => {
      toast.success(ACTION_TOAST[input.action]);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: reportKeys.all });
    },
  });
}
