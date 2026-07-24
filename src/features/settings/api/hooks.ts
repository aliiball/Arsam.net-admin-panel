import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { api } from '@/lib/api/client';
import { getFeatureFlags, setFeatureFlags } from '@/lib/settings/feature-flags-store';
import { settingsSchema, type Settings, type SettingsPatch } from '../schemas/settings';

export const settingsKeys = {
  all: ['settings'] as const,
};

/** Fetch the full settings envelope (general + flags + layoutDefaults). */
export function useSettings() {
  return useQuery({
    queryKey: settingsKeys.all,
    queryFn: () => api.get<Settings>('/settings'),
  });
}

/**
 * Patch a subset of settings. Optimistically updates BOTH the query cache AND
 * the live feature-flag store, so `useFeatureFlag` consumers reflect a flag
 * change instantly. Rolls back both on error; re-syncs from the server on success.
 */
export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: SettingsPatch) => api.patch<Settings>('/settings', patch),
    onMutate: async (patch) => {
      await qc.cancelQueries({ queryKey: settingsKeys.all });
      const previous = qc.getQueryData<Settings>(settingsKeys.all);
      const previousFlags = getFeatureFlags();
      if (previous) {
        // Re-parse the merge so the optimistic value is a clean, fully-typed Settings.
        const optimistic = settingsSchema.parse({
          general: { ...previous.general, ...patch.general },
          flags: { ...previous.flags, ...patch.flags },
          layoutDefaults: { ...previous.layoutDefaults, ...patch.layoutDefaults },
        });
        qc.setQueryData<Settings>(settingsKeys.all, optimistic);
        if (patch.flags) setFeatureFlags(optimistic.flags);
      }
      return { previous, previousFlags };
    },
    onError: (_err, _patch, ctx) => {
      if (ctx?.previous) qc.setQueryData(settingsKeys.all, ctx.previous);
      if (ctx?.previousFlags) setFeatureFlags(ctx.previousFlags);
      toast.error('Ayar güncellenemedi. Değişiklik geri alındı.');
    },
    onSuccess: (data) => {
      qc.setQueryData(settingsKeys.all, data);
      setFeatureFlags(data.flags);
      toast.success('Ayarlar kaydedildi.');
    },
  });
}
