import { z } from 'zod';

import { LOCATION_STATUSES } from '../data/locations';

// Re-export the shared ordering helpers (single origin in `@/lib/order`) so the
// module can `import { sortByOrder } from '../schemas/location'` like categories.
export { sortByOrder, nextOrder } from '@/lib/order';

/** A neighborhood (mahalle) — the leaf of the geo hierarchy. */
export const neighborhoodSchema = z.object({
  id: z.string(),
  name: z.string(),
  order: z.number(),
});
export type Neighborhood = z.infer<typeof neighborhoodSchema>;

/** A district (ilçe) with its neighborhoods. */
export const districtSchema = z.object({
  id: z.string(),
  /** Stable slug key (e.g. `kadikoy`). */
  key: z.string(),
  label: z.string(),
  order: z.number(),
  status: z.enum(LOCATION_STATUSES),
  neighborhoods: z.array(neighborhoodSchema),
});
export type District = z.infer<typeof districtSchema>;

/** A province (il) with its districts. Top of the geo hierarchy. */
export const provinceSchema = z.object({
  id: z.string(),
  /** Turkish plate code (plaka), e.g. `34`. */
  code: z.string(),
  label: z.string(),
  order: z.number(),
  status: z.enum(LOCATION_STATUSES),
  districts: z.array(districtSchema),
});
export type Province = z.infer<typeof provinceSchema>;

// ---------------------------------------------------------------------------
// Form schemas
// ---------------------------------------------------------------------------

/** RHF/Zod form for a province's meta (plate code, label, status). */
export const provinceFormSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{2}$/, 'İki haneli plaka kodu girin (ör. 34).'),
  label: z.string().trim().min(2, 'En az 2 karakter'),
  status: z.enum(LOCATION_STATUSES),
});
export type ProvinceFormValues = z.infer<typeof provinceFormSchema>;

/** RHF/Zod form for a district's meta (slug key, label, status). */
export const districtFormSchema = z.object({
  key: z
    .string()
    .trim()
    .min(2, 'En az 2 karakter')
    .regex(/^[a-z][a-z0-9-]*$/, 'Küçük harf, rakam ve tire (a-z, 0-9, -) kullanın'),
  label: z.string().trim().min(2, 'En az 2 karakter'),
  status: z.enum(LOCATION_STATUSES),
});
export type DistrictFormValues = z.infer<typeof districtFormSchema>;

/** RHF/Zod form for a neighborhood (just its name). */
export const neighborhoodFormSchema = z.object({
  name: z.string().trim().min(2, 'En az 2 karakter'),
});
export type NeighborhoodFormValues = z.infer<typeof neighborhoodFormSchema>;

/** Payload for any reorder endpoint: ids in the desired order. */
export const reorderInputSchema = z.object({ order: z.array(z.string()).min(1) });
export type ReorderInput = z.infer<typeof reorderInputSchema>;

// ---------------------------------------------------------------------------
// PURE helpers (UI-independent, unit-testable)
// ---------------------------------------------------------------------------

/**
 * True when `code` is unique among `existing` provinces, ignoring the province
 * currently being edited (`selfId`). Comparison is trimmed/case-insensitive.
 */
export function validateCodeUnique(
  code: string,
  existing: { id: string; code: string }[],
  selfId?: string,
): boolean {
  const norm = code.trim();
  return !existing.some((p) => p.id !== selfId && p.code === norm);
}

/**
 * True when `key` is unique among `existing` siblings (districts within a
 * province), ignoring the one being edited (`selfId`). Case-insensitive (tr).
 */
export function validateKeyUnique(
  key: string,
  existing: { id: string; key: string }[],
  selfId?: string,
): boolean {
  const norm = key.trim().toLocaleLowerCase('tr');
  return !existing.some((d) => d.id !== selfId && d.key.toLocaleLowerCase('tr') === norm);
}
