import { http, HttpResponse } from 'msw';

import { API_BASE_URL } from '@/lib/api/client';
import { getAuditLog } from '@/lib/audit';
import { getListingsSnapshot } from '@/features/listings/api/handlers';
import { deriveNotifications, type NotificationsPayload } from '../data/notifications';

/**
 * Notification center endpoint. Derives everything from the EXISTING mock DB
 * (pending listings + audit log) — no new source of truth (task 021).
 */
export const notificationsHandlers = [
  http.get(`${API_BASE_URL}/notifications`, () => {
    const payload: NotificationsPayload = deriveNotifications(getListingsSnapshot(), getAuditLog());
    return HttpResponse.json(payload);
  }),
];
