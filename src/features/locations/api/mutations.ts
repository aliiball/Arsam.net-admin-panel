import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { api } from '@/lib/api/client';
import type { Paginated } from '@/lib/api/types';
import { provinceKeys } from './queries';
import type {
  DistrictFormValues,
  NeighborhoodFormValues,
  Province,
  ProvinceFormValues,
} from '../schemas/location';

/** Create or update a province's meta. `id` present → PATCH, else create. */
export function useUpsertProvince() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id?: string; values: ProvinceFormValues }) =>
      id ? api.patch<Province>(`/provinces/${id}`, values) : api.post<Province>('/provinces', values),
    onSuccess: (data, vars) => {
      qc.setQueryData(provinceKeys.detail(data.id), data);
      void qc.invalidateQueries({ queryKey: provinceKeys.all });
      toast.success(vars.id ? 'İl güncellendi.' : 'İl oluşturuldu.');
    },
    onError: () => toast.error('İl kaydedilemedi.'),
  });
}

/**
 * Optimistic province reorder: writes the new order to the list cache, rolls
 * back on error. `ids` is the full ordered id list.
 */
export function useReorderProvinces(query: Parameters<typeof provinceKeys.list>[0]) {
  const qc = useQueryClient();
  const listKey = provinceKeys.list(query);
  return useMutation({
    mutationFn: (ids: string[]) => api.post<Province[]>('/provinces/reorder', { order: ids }),
    onMutate: async (ids) => {
      await qc.cancelQueries({ queryKey: listKey });
      const previous = qc.getQueryData<Paginated<Province>>(listKey);
      if (previous) {
        const rank = new Map(ids.map((id, i) => [id, i]));
        const items = [...previous.items]
          .map((p) => ({ ...p, order: rank.get(p.id) ?? p.order }))
          .sort((a, b) => a.order - b.order);
        qc.setQueryData(listKey, { ...previous, items });
      }
      return { previous };
    },
    onError: (_e, _ids, ctx) => {
      if (ctx?.previous) qc.setQueryData(listKey, ctx.previous);
      toast.error('Sıralama başarısız. Değişiklik geri alındı.');
    },
    onSettled: () => void qc.invalidateQueries({ queryKey: provinceKeys.all }),
  });
}

/** Upsert a district on a province. `districtId` present → update. */
export function useUpsertDistrict(provinceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ districtId, values }: { districtId?: string; values: DistrictFormValues }) =>
      api.post<Province>(`/provinces/${provinceId}/districts`, {
        ...(districtId ? { id: districtId } : {}),
        ...values,
      }),
    onSuccess: (data, vars) => {
      qc.setQueryData(provinceKeys.detail(provinceId), data);
      void qc.invalidateQueries({ queryKey: provinceKeys.all });
      toast.success(vars.districtId ? 'İlçe güncellendi.' : 'İlçe eklendi.');
    },
    onError: () => toast.error('İlçe kaydedilemedi.'),
  });
}

/** Reorder a province's districts (up/down). `ids` is the full ordered list. */
export function useReorderDistricts(provinceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => api.post<Province>(`/provinces/${provinceId}/districts/reorder`, { order: ids }),
    onSuccess: (data) => {
      qc.setQueryData(provinceKeys.detail(provinceId), data);
      void qc.invalidateQueries({ queryKey: provinceKeys.all });
    },
    onError: () => toast.error('İlçe sıralaması başarısız.'),
  });
}

/** Delete a district from a province. */
export function useDeleteDistrict(provinceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (districtId: string) => api.delete<Province>(`/provinces/${provinceId}/districts/${districtId}`),
    onSuccess: (data) => {
      qc.setQueryData(provinceKeys.detail(provinceId), data);
      void qc.invalidateQueries({ queryKey: provinceKeys.all });
      toast.success('İlçe silindi.');
    },
    onError: () => toast.error('İlçe silinemedi.'),
  });
}

/** Upsert a neighborhood within a district. `neighborhoodId` present → update. */
export function useUpsertNeighborhood(provinceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      districtId,
      neighborhoodId,
      values,
    }: {
      districtId: string;
      neighborhoodId?: string;
      values: NeighborhoodFormValues;
    }) =>
      api.post<Province>(`/provinces/${provinceId}/districts/${districtId}/neighborhoods`, {
        ...(neighborhoodId ? { id: neighborhoodId } : {}),
        ...values,
      }),
    onSuccess: (data, vars) => {
      qc.setQueryData(provinceKeys.detail(provinceId), data);
      void qc.invalidateQueries({ queryKey: provinceKeys.all });
      toast.success(vars.neighborhoodId ? 'Mahalle güncellendi.' : 'Mahalle eklendi.');
    },
    onError: () => toast.error('Mahalle kaydedilemedi.'),
  });
}

/** Reorder neighborhoods within a district. */
export function useReorderNeighborhoods(provinceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ districtId, ids }: { districtId: string; ids: string[] }) =>
      api.post<Province>(`/provinces/${provinceId}/districts/${districtId}/neighborhoods/reorder`, { order: ids }),
    onSuccess: (data) => {
      qc.setQueryData(provinceKeys.detail(provinceId), data);
      void qc.invalidateQueries({ queryKey: provinceKeys.all });
    },
    onError: () => toast.error('Mahalle sıralaması başarısız.'),
  });
}

/** Delete a neighborhood from a district. */
export function useDeleteNeighborhood(provinceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ districtId, neighborhoodId }: { districtId: string; neighborhoodId: string }) =>
      api.delete<Province>(`/provinces/${provinceId}/districts/${districtId}/neighborhoods/${neighborhoodId}`),
    onSuccess: (data) => {
      qc.setQueryData(provinceKeys.detail(provinceId), data);
      void qc.invalidateQueries({ queryKey: provinceKeys.all });
      toast.success('Mahalle silindi.');
    },
    onError: () => toast.error('Mahalle silinemedi.'),
  });
}
