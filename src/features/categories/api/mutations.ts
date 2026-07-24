import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { api } from '@/lib/api/client';
import { categoryKeys } from './queries';
import type { AttributeFormValues, Category, CategoryFormValues } from '../schemas/category';

/** Create or update a category's meta. `id` present → PATCH, else create. */
export function useUpsertCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id?: string; values: CategoryFormValues }) =>
      id ? api.patch<Category>(`/categories/${id}`, values) : api.post<Category>('/categories', values),
    onSuccess: (data, vars) => {
      qc.setQueryData(categoryKeys.detail(data.id), data);
      void qc.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success(vars.id ? 'Kategori güncellendi.' : 'Kategori oluşturuldu.');
    },
    onError: () => toast.error('Kategori kaydedilemedi.'),
  });
}

/**
 * Optimistic category reorder: writes the new order to the list cache, rolls
 * back on error. `ids` is the full ordered id list.
 */
export function useReorderCategories(query: Parameters<typeof categoryKeys.list>[0]) {
  const qc = useQueryClient();
  const listKey = categoryKeys.list(query);
  return useMutation({
    mutationFn: (ids: string[]) => api.post<Category[]>('/categories/reorder', { order: ids }),
    onMutate: async (ids) => {
      await qc.cancelQueries({ queryKey: listKey });
      const previous = qc.getQueryData<{ items: Category[]; total: number; page: number; pageSize: number }>(listKey);
      if (previous) {
        const rank = new Map(ids.map((id, i) => [id, i]));
        const items = [...previous.items]
          .map((c) => ({ ...c, order: rank.get(c.id) ?? c.order }))
          .sort((a, b) => a.order - b.order);
        qc.setQueryData(listKey, { ...previous, items });
      }
      return { previous };
    },
    onError: (_e, _ids, ctx) => {
      if (ctx?.previous) qc.setQueryData(listKey, ctx.previous);
      toast.error('Sıralama başarısız. Değişiklik geri alındı.');
    },
    onSettled: () => void qc.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}

/** Upsert a single attribute on a category. `attributeId` present → update. */
export function useUpsertAttribute(categoryId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ attributeId, values }: { attributeId?: string; values: AttributeFormValues }) =>
      api.post<Category>(`/categories/${categoryId}/attributes`, {
        ...(attributeId ? { id: attributeId } : {}),
        ...values,
      }),
    onSuccess: (data, vars) => {
      qc.setQueryData(categoryKeys.detail(categoryId), data);
      void qc.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success(vars.attributeId ? 'Nitelik güncellendi.' : 'Nitelik eklendi.');
    },
    onError: () => toast.error('Nitelik kaydedilemedi.'),
  });
}

/** Reorder a category's attributes (up/down). `ids` is the full ordered list. */
export function useReorderAttributes(categoryId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => api.post<Category>(`/categories/${categoryId}/attributes/reorder`, { order: ids }),
    onSuccess: (data) => {
      qc.setQueryData(categoryKeys.detail(categoryId), data);
      void qc.invalidateQueries({ queryKey: categoryKeys.all });
    },
    onError: () => toast.error('Nitelik sıralaması başarısız.'),
  });
}

/** Delete a single attribute from a category. */
export function useDeleteAttribute(categoryId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (attributeId: string) => api.delete<Category>(`/categories/${categoryId}/attributes/${attributeId}`),
    onSuccess: (data) => {
      qc.setQueryData(categoryKeys.detail(categoryId), data);
      void qc.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success('Nitelik silindi.');
    },
    onError: () => toast.error('Nitelik silinemedi.'),
  });
}
