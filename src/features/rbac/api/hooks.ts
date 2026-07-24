import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { api } from '@/lib/api/client';
import { getPermissionMatrix, setPermissionMatrix } from '@/lib/permissions/permission-store';
import {
  toggleMatrix,
  type PermissionToggleInput,
  type RbacMatrixEnvelope,
} from '../schemas/rbac';

export const rbacKeys = {
  matrix: ['rbac', 'matrix'] as const,
};

/** Fetch the full role/permission matrix + catalog. */
export function useRbacMatrix() {
  return useQuery({
    queryKey: rbacKeys.matrix,
    queryFn: () => api.get<RbacMatrixEnvelope>('/rbac/matrix'),
  });
}

/**
 * Toggle one matrix cell. Optimistically updates BOTH the query cache AND the
 * live permission store, so `Can`/nav/RouteGuard reflect the change instantly.
 * Rolls back both on error; re-syncs from the server envelope on success.
 */
export function useTogglePermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PermissionToggleInput) =>
      api.post<RbacMatrixEnvelope>('/rbac/matrix/toggle', input),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: rbacKeys.matrix });
      const previousEnvelope = qc.getQueryData<RbacMatrixEnvelope>(rbacKeys.matrix);
      const previousStore = getPermissionMatrix();
      const optimistic = toggleMatrix(previousStore, input.role, input.permission, input.granted);
      if (previousEnvelope) {
        qc.setQueryData<RbacMatrixEnvelope>(rbacKeys.matrix, { ...previousEnvelope, matrix: optimistic });
      }
      setPermissionMatrix(optimistic);
      return { previousEnvelope, previousStore };
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.previousEnvelope) qc.setQueryData(rbacKeys.matrix, ctx.previousEnvelope);
      if (ctx?.previousStore) setPermissionMatrix(ctx.previousStore);
      toast.error('İzin güncellenemedi. Değişiklik geri alındı.');
    },
    onSuccess: (data, input) => {
      qc.setQueryData(rbacKeys.matrix, data);
      setPermissionMatrix(data.matrix);
      toast.success(input.granted ? 'İzin verildi.' : 'İzin kaldırıldı.');
    },
  });
}
