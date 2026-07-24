import {
  buildDailySeries,
  countByDay,
  dayKey,
  earliestDayKey,
  latestDayKey,
  rateOf,
  shiftDayKey,
  sumBy,
  sumByDay,
} from '@/lib/analytics';
import {
  CATEGORIES,
  CATEGORY_LABELS,
  STATUSES,
  STATUS_LABELS,
  type Category,
  type ListingStatus,
} from '@/features/listings/data/taxonomy';
import type { Listing } from '@/features/listings/schemas/listing';
import type { Payment } from '@/features/promotions/schemas/promotion';
import type { Report } from '@/features/messages/schemas/report';
import {
  REPORTS_RANGE_DAYS,
  type ReportsOverview,
  type ReportsRange,
} from '../schemas/reports';

/** Read-only snapshots the analytics layer derives everything from. */
export interface OverviewInput {
  listings: readonly Listing[];
  payments: readonly Payment[];
  reports: readonly Report[];
}

/** Net revenue contribution of a single payment: paid amount minus refunds. */
export function netRevenue(payment: Pick<Payment, 'amount' | 'refundedAmount' | 'status'>): number {
  if (payment.status === 'failed') return 0;
  return payment.amount - (payment.refundedAmount ?? 0);
}

/** Gross paid amount of a payment (0 for failed), before refunds. */
function grossPaid(payment: Pick<Payment, 'amount' | 'status'>): number {
  return payment.status === 'failed' ? 0 : payment.amount;
}

/**
 * Resolve the inclusive `[from, to]` day window for a range. "to" is the latest
 * day present in the data (a stable, data-derived "today"); "from" walks back
 * `days - 1` for a fixed window, or clamps to the earliest day for "all".
 */
export function resolveWindow(
  input: OverviewInput,
  range: ReportsRange,
): { from: string; to: string } {
  const days: string[] = [
    ...input.listings.map((l) => dayKey(l.createdAt)),
    ...input.payments.map((p) => dayKey(p.createdAt)),
    ...input.reports.map((r) => dayKey(r.createdAt)),
  ];
  const to = latestDayKey(days) ?? '1970-01-01';
  const earliest = earliestDayKey(days) ?? to;
  const windowDays = REPORTS_RANGE_DAYS[range];
  const from =
    windowDays === null
      ? earliest
      : (() => {
          const start = shiftDayKey(to, -(windowDays - 1));
          return start < earliest ? earliest : start;
        })();
  return { from, to };
}

function inWindow(iso: string, from: string, to: string): boolean {
  const key = dayKey(iso);
  return key >= from && key <= to;
}

/**
 * Compute the full analytics overview from raw snapshots — a PURE function of
 * its inputs (no clock, no globals), so it is deterministic and unit-testable.
 * Every metric is scoped to the resolved window so the range selector matters.
 */
export function computeOverview(input: OverviewInput, range: ReportsRange): ReportsOverview {
  const { from, to } = resolveWindow(input, range);

  const listings = input.listings.filter((l) => inWindow(l.createdAt, from, to));
  const payments = input.payments.filter((p) => inWindow(p.createdAt, from, to));
  const reports = input.reports.filter((r) => inWindow(r.createdAt, from, to));

  const gross = sumBy(payments, grossPaid);
  const refunds = sumBy(payments, (p) => p.refundedAmount ?? 0);
  const totalRevenue = gross - refunds;

  const kpis = {
    totalListings: listings.length,
    activeListings: listings.filter((l) => l.status === 'active').length,
    totalRevenue,
    refundRate: rateOf(refunds, gross),
    pendingModeration: listings.filter((l) => l.status === 'pending').length,
    openReports: reports.filter((r) => r.status === 'open').length,
  };

  const listingsTrend = buildDailySeries(
    from,
    to,
    countByDay(listings, (l) => l.createdAt),
  );
  const revenueTrend = buildDailySeries(
    from,
    to,
    sumByDay(payments, (p) => p.createdAt, netRevenue),
  );

  const byCategory = (CATEGORIES as readonly Category[]).map((category) => ({
    key: category,
    label: CATEGORY_LABELS[category],
    value: listings.filter((l) => l.category === category).length,
  }));

  const byStatus = (STATUSES as readonly ListingStatus[]).map((status) => ({
    key: status,
    label: STATUS_LABELS[status],
    value: listings.filter((l) => l.status === status).length,
  }));

  // Moderation funnel: everything submitted flows into a terminal state.
  const moderationFunnel = [
    { stage: 'submitted', label: 'Gönderilen', value: listings.length },
    { stage: 'pending', label: 'Bekleyen', value: kpis.pendingModeration },
    { stage: 'active', label: 'Onaylanan', value: kpis.activeListings },
    { stage: 'rejected', label: 'Reddedilen', value: listings.filter((l) => l.status === 'rejected').length },
  ];

  return {
    range,
    from,
    to,
    kpis,
    listingsTrend,
    revenueTrend,
    moderationFunnel,
    byCategory,
    byStatus,
  };
}
