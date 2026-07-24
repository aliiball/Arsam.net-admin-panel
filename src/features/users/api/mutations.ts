import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { api } from '@/lib/api/client';
import type { UserActionType } from '../data/users';
import { userKeys } from './queries';
import type { User, UserActionInput } from '../schemas/user';

const ACTION_STATUS: Record<UserActionType, User['status'] | undefined> = {
  verify: 'active',
  suspend: 'suspended',
  ban: 'banned',
  unban: 'active',
};

const ACTION_TOAST: Record<UserActionType, string> = {
  verify: 'Kullanıcı doğrulandı.',
  suspend: 'Kullanıcı askıya alındı.',
  ban: 'Kullanıcı yasaklandı.',
  unban: 'Kullanıcının yasağı kaldırıldı.',
};

/**
 * Optimistic user lifecycle action (verify / suspend / ban / unban) with
 * rollback + toasts. Mirrors the listings moderation mutation.
 */
export function useUserAction(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UserActionInput) => api.post<User>(`/users/${id}/action`, input),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: userKeys.detail(id) });
      const previous = qc.getQueryData<User>(userKeys.detail(id));
      const nextStatus = ACTION_STATUS[input.action];
      if (previous && nextStatus) {
        qc.setQueryData<User>(userKeys.detail(id), { ...previous, status: nextStatus });
      }
      return { previous };
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.previous) qc.setQueryData(userKeys.detail(id), ctx.previous);
      toast.error('İşlem başarısız. Değişiklik geri alındı.');
    },
    onSuccess: (_data, input) => {
      toast.success(ACTION_TOAST[input.action]);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
