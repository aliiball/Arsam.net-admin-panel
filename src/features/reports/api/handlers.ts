import { http, HttpResponse } from 'msw';

import { API_BASE_URL } from '@/lib/api/client';
import { getListingsSnapshot } from '@/features/listings/api/handlers';
import { getPaymentsSnapshot } from '@/features/promotions/api/handlers';
import { getReportsSnapshot } from '@/features/messages/api/handlers';
import { computeOverview } from '../lib/overview';
import { reportsOverviewSchema, reportsRangeSchema } from '../schemas/reports';

export const reportsHandlers = [
  // Read-only analytics: derives every metric from the existing mock DBs.
  http.get(`${API_BASE_URL}/reports/overview`, ({ request }) => {
    const url = new URL(request.url);
    const parsedRange = reportsRangeSchema.safeParse(url.searchParams.get('range') ?? '30d');
    const range = parsedRange.success ? parsedRange.data : '30d';

    const overview = computeOverview(
      {
        listings: getListingsSnapshot(),
        payments: getPaymentsSnapshot(),
        reports: getReportsSnapshot(),
      },
      range,
    );

    // Validate the envelope against the schema so the contract stays honest.
    return HttpResponse.json(reportsOverviewSchema.parse(overview));
  }),
];
