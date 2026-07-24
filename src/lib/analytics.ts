/**
 * Pure, deterministic analytics helpers for read-only reporting.
 *
 * All time math keys off explicit `YYYY-MM-DD` day strings derived from data —
 * there is NO `Date.now()` / argument-less `new Date()` anywhere, so the same
 * inputs always produce the same outputs (unit-testable, story-safe).
 */

const MS_PER_DAY = 86_400_000;

/** The `YYYY-MM-DD` day bucket for an ISO timestamp. */
export function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

/** Sum a numeric projection over a list (0 for an empty list). */
export function sumBy<T>(items: readonly T[], value: (item: T) => number): number {
  return items.reduce((total, item) => total + value(item), 0);
}

/** Safe ratio in [0, ∞); returns 0 when the denominator is 0 (never NaN/Infinity). */
export function rateOf(part: number, whole: number): number {
  return whole === 0 ? 0 : part / whole;
}

/** The latest (max) day key in a set, or `undefined` when empty. */
export function latestDayKey(dayKeys: readonly string[]): string | undefined {
  return dayKeys.reduce<string | undefined>(
    (latest, key) => (latest === undefined || key > latest ? key : latest),
    undefined,
  );
}

/** The earliest (min) day key in a set, or `undefined` when empty. */
export function earliestDayKey(dayKeys: readonly string[]): string | undefined {
  return dayKeys.reduce<string | undefined>(
    (earliest, key) => (earliest === undefined || key < earliest ? key : earliest),
    undefined,
  );
}

/** Shift a `YYYY-MM-DD` key by whole days (UTC), returning a new key. */
export function shiftDayKey(key: string, deltaDays: number): string {
  const ms = Date.parse(`${key}T00:00:00.000Z`) + deltaDays * MS_PER_DAY;
  return new Date(ms).toISOString().slice(0, 10);
}

/** Inclusive list of day keys from `fromKey` to `toKey` (empty when from > to). */
export function eachDayKey(fromKey: string, toKey: string): string[] {
  if (fromKey > toKey) return [];
  const keys: string[] = [];
  for (let key = fromKey; key <= toKey; key = shiftDayKey(key, 1)) {
    keys.push(key);
    // Hard stop: a full year of buckets is far beyond any real reporting window.
    if (keys.length > 366) break;
  }
  return keys;
}

/** Count items per day bucket keyed by their ISO date. */
export function countByDay<T>(items: readonly T[], date: (item: T) => string): Record<string, number> {
  const buckets: Record<string, number> = {};
  for (const item of items) {
    const key = dayKey(date(item));
    buckets[key] = (buckets[key] ?? 0) + 1;
  }
  return buckets;
}

/** Sum a numeric projection per day bucket keyed by each item's ISO date. */
export function sumByDay<T>(
  items: readonly T[],
  date: (item: T) => string,
  value: (item: T) => number,
): Record<string, number> {
  const buckets: Record<string, number> = {};
  for (const item of items) {
    const key = dayKey(date(item));
    buckets[key] = (buckets[key] ?? 0) + value(item);
  }
  return buckets;
}

export interface MetricPoint {
  date: string;
  value: number;
}

/**
 * Build a gap-free daily series across `[fromKey, toKey]`, reading each day's
 * value from `buckets` (missing days become 0). Deterministic and continuous so
 * line/area charts never skip days.
 */
export function buildDailySeries(
  fromKey: string,
  toKey: string,
  buckets: Record<string, number>,
): MetricPoint[] {
  return eachDayKey(fromKey, toKey).map((date) => ({ date, value: buckets[date] ?? 0 }));
}
