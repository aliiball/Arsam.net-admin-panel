/**
 * Shared ordering helpers for manageable, reorderable taxonomies
 * (categories, locations, …). UI-independent and unit-testable.
 */

/** Ascending sort by `order` (stable). Does not mutate the input. */
export function sortByOrder<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order);
}

/** Next `order` value = max(order) + 1 (0 when empty). */
export function nextOrder(items: { order: number }[]): number {
  return items.reduce((max, i) => Math.max(max, i.order), -1) + 1;
}
