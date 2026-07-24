/**
 * Category & attribute taxonomy metadata: attribute types, category statuses,
 * icon options, and the per-key definitions used to SEED the manageable
 * taxonomy from the listings vertical's static `CATEGORY_ATTRIBUTES`.
 */

import {
  CATEGORIES,
  CATEGORY_ATTRIBUTES,
  CATEGORY_LABELS,
  DEED_LABELS,
  HEATING_LABELS,
  ZONING_LABELS,
} from '@/features/listings/data/taxonomy';

/** Field types an attribute can take in a category's dynamic form. */
export const ATTRIBUTE_TYPES = ['number', 'text', 'select', 'boolean'] as const;
export type AttributeType = (typeof ATTRIBUTE_TYPES)[number];

export const ATTRIBUTE_TYPE_LABELS: Record<AttributeType, string> = {
  number: 'Sayı',
  text: 'Metin',
  select: 'Seçim',
  boolean: 'Evet/Hayır',
};

/** Category lifecycle status. */
export const CATEGORY_STATUSES = ['active', 'archived'] as const;
export type CategoryStatus = (typeof CATEGORY_STATUSES)[number];

export const CATEGORY_STATUS_LABELS: Record<CategoryStatus, string> = {
  active: 'Aktif',
  archived: 'Arşivlendi',
};

/** Curated lucide icon names selectable for a category. */
export const CATEGORY_ICONS = ['Home', 'Building2', 'LandPlot', 'CalendarClock', 'Hotel'] as const;
export type CategoryIcon = (typeof CATEGORY_ICONS)[number];

/** Default icon per seeded category key (falls back to Building2). */
const CATEGORY_ICON_BY_KEY: Record<string, CategoryIcon> = {
  konut: 'Home',
  isyeri: 'Building2',
  arsa: 'LandPlot',
  devremulk: 'CalendarClock',
  turistik: 'Hotel',
};

interface AttributeDef {
  label: string;
  type: AttributeType;
  required: boolean;
  unit?: string;
  options?: { value: string; label: string }[];
}

const asOptions = (labels: Record<string, string>) =>
  Object.entries(labels).map(([value, label]) => ({ value, label }));

/**
 * The known attribute keys (matching the listings form) and their metadata.
 * This is the SOURCE the seed derives from; editing happens in the module.
 */
export const ATTRIBUTE_DEFS: Record<string, AttributeDef> = {
  grossArea: { label: 'Brüt Alan', type: 'number', required: true, unit: 'm²' },
  netArea: { label: 'Net Alan', type: 'number', required: false, unit: 'm²' },
  rooms: { label: 'Oda Sayısı', type: 'text', required: false },
  buildingAge: { label: 'Bina Yaşı', type: 'number', required: false, unit: 'yıl' },
  floor: { label: 'Bulunduğu Kat', type: 'number', required: false },
  heating: { label: 'Isıtma', type: 'select', required: false, options: asOptions(HEATING_LABELS) },
  deedStatus: { label: 'Tapu Durumu', type: 'select', required: false, options: asOptions(DEED_LABELS) },
  zoning: { label: 'İmar Durumu', type: 'select', required: true, options: asOptions(ZONING_LABELS) },
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  konut: 'Daire, villa, müstakil ev ve rezidans ilanları.',
  isyeri: 'Dükkân, ofis, depo ve ticari işyeri ilanları.',
  arsa: 'Konut, ticari, tarla ve sanayi imarlı arsa ilanları.',
  devremulk: 'Dönemsel kullanım hakkı tanıyan devremülk ilanları.',
  turistik: 'Otel, pansiyon ve turistik tesis ilanları.',
};

/** Raw seed shape (id is assigned in the handler seed). */
export interface SeedCategory {
  key: string;
  label: string;
  description: string;
  icon: CategoryIcon;
  attributes: { key: string; label: string; type: AttributeType; required: boolean; unit?: string; options?: { value: string; label: string }[] }[];
}

/**
 * Build the seed categories from the listings vertical's static taxonomy so the
 * manageable module and the (still-working) listing form share ONE origin.
 */
export function buildSeedCategories(): SeedCategory[] {
  return CATEGORIES.map((key) => ({
    key,
    label: CATEGORY_LABELS[key],
    description: CATEGORY_DESCRIPTIONS[key] ?? '',
    icon: CATEGORY_ICON_BY_KEY[key] ?? 'Building2',
    attributes: (CATEGORY_ATTRIBUTES[key] ?? []).map((attrKey) => {
      const def = ATTRIBUTE_DEFS[attrKey] ?? { label: attrKey, type: 'text' as AttributeType, required: false };
      return {
        key: attrKey,
        label: def.label,
        type: def.type,
        required: def.required,
        ...(def.unit ? { unit: def.unit } : {}),
        ...(def.options ? { options: def.options } : {}),
      };
    }),
  }));
}
