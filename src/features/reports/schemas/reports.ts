import { z } from 'zod';

/** Relative time window for the analytics overview. */
export const REPORTS_RANGES = ['7d', '30d', '90d', 'all'] as const;
export const reportsRangeSchema = z.enum(REPORTS_RANGES);
export type ReportsRange = z.infer<typeof reportsRangeSchema>;

export const REPORTS_RANGE_LABELS: Record<ReportsRange, string> = {
  '7d': 'Son 7 gün',
  '30d': 'Son 30 gün',
  '90d': 'Son 90 gün',
  all: 'Tümü',
};

/** Window length in days, or `null` for the full data range ("all"). */
export const REPORTS_RANGE_DAYS: Record<ReportsRange, number | null> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  all: null,
};

/** One point in a daily time series. */
export const metricPointSchema = z.object({
  date: z.string(),
  value: z.number(),
});
export type MetricPoint = z.infer<typeof metricPointSchema>;

/** A labelled slice of a categorical breakdown (donut/bar). */
export const breakdownSliceSchema = z.object({
  key: z.string(),
  label: z.string(),
  value: z.number(),
});
export type BreakdownSlice = z.infer<typeof breakdownSliceSchema>;

/** One stage of the moderation funnel. */
export const funnelStageSchema = z.object({
  stage: z.string(),
  label: z.string(),
  value: z.number(),
});
export type FunnelStage = z.infer<typeof funnelStageSchema>;

/** Headline KPIs, all computed over the selected window. */
export const reportsKpisSchema = z.object({
  totalListings: z.number(),
  activeListings: z.number(),
  totalRevenue: z.number(),
  /** Refunds ÷ gross paid, in [0, 1]. */
  refundRate: z.number(),
  pendingModeration: z.number(),
  openReports: z.number(),
});
export type ReportsKpis = z.infer<typeof reportsKpisSchema>;

/** The full analytics envelope returned by `GET /reports/overview`. */
export const reportsOverviewSchema = z.object({
  range: reportsRangeSchema,
  /** Inclusive window bounds as `YYYY-MM-DD` day keys. */
  from: z.string(),
  to: z.string(),
  kpis: reportsKpisSchema,
  listingsTrend: z.array(metricPointSchema),
  revenueTrend: z.array(metricPointSchema),
  moderationFunnel: z.array(funnelStageSchema),
  byCategory: z.array(breakdownSliceSchema),
  byStatus: z.array(breakdownSliceSchema),
});
export type ReportsOverview = z.infer<typeof reportsOverviewSchema>;
