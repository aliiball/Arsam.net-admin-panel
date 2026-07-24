/**
 * Location taxonomy metadata + the seed derivation from the listings vertical's
 * static `LOCATIONS`, so the manageable module and the (still-working) listing
 * form + filters share ONE origin.
 */

import { LOCATIONS } from '@/features/listings/data/taxonomy';

/** Lifecycle status shared by provinces and districts. */
export const LOCATION_STATUSES = ['active', 'archived'] as const;
export type LocationStatus = (typeof LOCATION_STATUSES)[number];

export const LOCATION_STATUS_LABELS: Record<LocationStatus, string> = {
  active: 'Aktif',
  archived: 'Arşivlendi',
};

// Raw seed shapes (ids are assigned in the handler seed).
export interface SeedNeighborhood {
  name: string;
}
export interface SeedDistrict {
  key: string;
  label: string;
  neighborhoods: SeedNeighborhood[];
}
export interface SeedProvince {
  code: string;
  label: string;
  districts: SeedDistrict[];
}

/**
 * Build the seed provinces from the listings vertical's static `LOCATIONS` map
 * (il → ilçe → mahalle) so the geo taxonomy has a single origin.
 */
export function buildSeedProvinces(): SeedProvince[] {
  return Object.entries(LOCATIONS).map(([code, prov]) => ({
    code,
    label: prov.label,
    districts: Object.entries(prov.districts).map(([key, district]) => ({
      key,
      label: district.label,
      neighborhoods: district.neighborhoods.map((name) => ({ name })),
    })),
  }));
}
