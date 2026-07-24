import { z } from 'zod';

import { ATTRIBUTE_TYPES, CATEGORY_STATUSES, CATEGORY_ICONS } from '../data/categories';

// Re-export the shared ordering helpers so existing `../schemas/category`
// imports keep working (single origin lives in `@/lib/order`).
export { sortByOrder, nextOrder } from '@/lib/order';

/** A single select option (value + display label). */
export const attributeOptionSchema = z.object({
  value: z.string().trim().min(1, 'Değer zorunludur'),
  label: z.string().trim().min(1, 'Etiket zorunludur'),
});
export type AttributeOption = z.infer<typeof attributeOptionSchema>;

/** A dynamic attribute field attached to a category. Source of truth for the type. */
export const attributeFieldSchema = z.object({
  id: z.string(),
  /** Form field key (stable machine name, e.g. `grossArea`). */
  key: z.string(),
  label: z.string(),
  type: z.enum(ATTRIBUTE_TYPES),
  required: z.boolean(),
  unit: z.string().optional(),
  options: z.array(attributeOptionSchema).optional(),
  order: z.number(),
});
export type AttributeField = z.infer<typeof attributeFieldSchema>;

/** A managed category (taxonomy node) with its attribute set. */
export const categorySchema = z.object({
  id: z.string(),
  /** Stable key aligned with the listings taxonomy (konut|isyeri|…). */
  key: z.string(),
  label: z.string(),
  description: z.string(),
  icon: z.enum(CATEGORY_ICONS).optional(),
  order: z.number(),
  status: z.enum(CATEGORY_STATUSES),
  attributes: z.array(attributeFieldSchema),
});
export type Category = z.infer<typeof categorySchema>;

/** RHF/Zod form for editing a category's meta (not its attributes). */
export const categoryFormSchema = z.object({
  key: z
    .string()
    .trim()
    .min(2, 'En az 2 karakter')
    .regex(/^[a-z][a-z0-9-]*$/, 'Küçük harf, rakam ve tire (a-z, 0-9, -) kullanın'),
  label: z.string().trim().min(2, 'En az 2 karakter'),
  description: z.string().trim().max(280, 'En fazla 280 karakter'),
  icon: z.enum(CATEGORY_ICONS).optional(),
  status: z.enum(CATEGORY_STATUSES),
});
export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

/** RHF/Zod form for adding/editing a single attribute field. */
export const attributeFormSchema = z
  .object({
    key: z
      .string()
      .trim()
      .min(2, 'En az 2 karakter')
      .regex(/^[a-zA-Z][a-zA-Z0-9]*$/, 'Harf ile başlayın; harf ve rakam (camelCase) kullanın'),
    label: z.string().trim().min(2, 'En az 2 karakter'),
    type: z.enum(ATTRIBUTE_TYPES),
    required: z.boolean(),
    unit: z.string().trim().optional(),
    options: z.array(attributeOptionSchema).optional(),
  })
  .refine((v) => v.type !== 'select' || (v.options?.length ?? 0) > 0, {
    message: 'Seçim tipinde en az bir seçenek girin.',
    path: ['options'],
  });
export type AttributeFormValues = z.infer<typeof attributeFormSchema>;

/** Payload for the reorder endpoint: category ids in the desired order. */
export const reorderInputSchema = z.object({ order: z.array(z.string()).min(1) });
export type ReorderInput = z.infer<typeof reorderInputSchema>;

// ---------------------------------------------------------------------------
// PURE helpers (UI-independent, unit-testable)
// ---------------------------------------------------------------------------

/**
 * True when `key` is unique among `existing` attributes, ignoring the field
 * currently being edited (`selfId`). Comparison is case-insensitive.
 */
export function validateAttributeKeyUnique(
  key: string,
  existing: { id: string; key: string }[],
  selfId?: string,
): boolean {
  const norm = key.trim().toLocaleLowerCase('tr');
  return !existing.some((a) => a.id !== selfId && a.key.toLocaleLowerCase('tr') === norm);
}
