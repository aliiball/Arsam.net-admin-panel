import { describe, expect, it } from 'vitest';

import {
  buildDailySeries,
  countByDay,
  dayKey,
  eachDayKey,
  earliestDayKey,
  latestDayKey,
  rateOf,
  shiftDayKey,
  sumBy,
  sumByDay,
} from './analytics';

describe('analytics helpers', () => {
  it('dayKey extracts the YYYY-MM-DD prefix', () => {
    expect(dayKey('2026-07-24T13:45:12.000Z')).toBe('2026-07-24');
  });

  it('sumBy sums a projection and is 0 for empty', () => {
    expect(sumBy([{ n: 2 }, { n: 3 }, { n: 5 }], (x) => x.n)).toBe(10);
    expect(sumBy([], () => 1)).toBe(0);
  });

  it('rateOf never divides by zero', () => {
    expect(rateOf(3, 12)).toBe(0.25);
    expect(rateOf(5, 0)).toBe(0);
  });

  it('latest/earliest day keys pick the bounds', () => {
    const keys = ['2026-07-02', '2026-06-30', '2026-07-10'];
    expect(latestDayKey(keys)).toBe('2026-07-10');
    expect(earliestDayKey(keys)).toBe('2026-06-30');
    expect(latestDayKey([])).toBeUndefined();
  });

  it('shiftDayKey moves whole days and crosses month boundaries', () => {
    expect(shiftDayKey('2026-07-24', -6)).toBe('2026-07-18');
    expect(shiftDayKey('2026-07-01', -1)).toBe('2026-06-30');
    expect(shiftDayKey('2026-06-30', 1)).toBe('2026-07-01');
  });

  it('eachDayKey enumerates inclusive ranges and is empty when reversed', () => {
    expect(eachDayKey('2026-07-01', '2026-07-04')).toEqual([
      '2026-07-01',
      '2026-07-02',
      '2026-07-03',
      '2026-07-04',
    ]);
    expect(eachDayKey('2026-07-04', '2026-07-01')).toEqual([]);
    expect(eachDayKey('2026-07-01', '2026-07-01')).toEqual(['2026-07-01']);
  });

  it('countByDay / sumByDay bucket by the item date', () => {
    const rows = [
      { at: '2026-07-01T09:00:00.000Z', amt: 100 },
      { at: '2026-07-01T18:00:00.000Z', amt: 50 },
      { at: '2026-07-03T10:00:00.000Z', amt: 20 },
    ];
    expect(countByDay(rows, (r) => r.at)).toEqual({ '2026-07-01': 2, '2026-07-03': 1 });
    expect(sumByDay(rows, (r) => r.at, (r) => r.amt)).toEqual({ '2026-07-01': 150, '2026-07-03': 20 });
  });

  it('buildDailySeries fills gaps with 0 and is deterministic', () => {
    const buckets = { '2026-07-01': 2, '2026-07-03': 5 };
    const series = buildDailySeries('2026-07-01', '2026-07-03', buckets);
    expect(series).toEqual([
      { date: '2026-07-01', value: 2 },
      { date: '2026-07-02', value: 0 },
      { date: '2026-07-03', value: 5 },
    ]);
    // Same inputs → identical output (no clock/randomness).
    expect(buildDailySeries('2026-07-01', '2026-07-03', buckets)).toEqual(series);
  });
});
