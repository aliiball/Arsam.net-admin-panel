import type { ParseContext, VocabItem } from '@/lib/ai';
import { CATEGORIES, CATEGORY_LABELS, LOCATIONS, STATUS_LABELS, type ListingStatus } from '../data/taxonomy';

/**
 * Turkish surface forms that map onto listing statuses. Drives the deterministic
 * NL parser's status matching (single origin — the FilterBar box and the global
 * assistant both parse through `lib/ai` with this context).
 */
const STATUS_ALIASES: Partial<Record<ListingStatus, string[]>> = {
  pending: ['bekleyen', 'beklemede'],
  active: ['aktif', 'yayında'],
  rejected: ['reddedilen', 'reddedildi'],
  expired: ['süresi dolmuş', 'süresi dolan'],
  draft: ['taslak'],
  archived: ['arşiv', 'arşivlenmiş'],
};

export const LISTING_STATUS_VOCAB: VocabItem[] = (
  ['pending', 'active', 'rejected', 'expired', 'draft', 'archived'] as const
).map((value) => {
  const aliases = STATUS_ALIASES[value];
  return aliases ? { value, label: STATUS_LABELS[value], aliases } : { value, label: STATUS_LABELS[value] };
});

export const LISTING_CATEGORY_VOCAB: VocabItem[] = CATEGORIES.map((c) => ({
  value: c,
  label: CATEGORY_LABELS[c],
}));

export const LISTING_CITY_VOCAB: VocabItem[] = Object.entries(LOCATIONS).map(([value, v]) => ({
  value,
  label: v.label,
}));

/** Vocabulary context for parsing listing NL filters (category/city/status/ranges). */
export function listingFilterContext(): ParseContext {
  return {
    entity: 'listing',
    routes: { listing: '/listings' },
    categories: LISTING_CATEGORY_VOCAB,
    cities: LISTING_CITY_VOCAB,
    statuses: LISTING_STATUS_VOCAB,
  };
}
