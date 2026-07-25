import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api/client';
import type { NotificationsPayload } from '../data/notifications';

export const notificationKeys = {
  all: ['notifications'] as const,
};

/**
 * Live notification feed for the command dock. Cheap + derived, so it refetches
 * on focus (default) to reflect moderation/audit writes from other surfaces.
 */
export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.all,
    queryFn: () => api.get<NotificationsPayload>('/notifications'),
    staleTime: 15_000,
  });
}

export type { NotificationsPayload };
