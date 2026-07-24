import { z } from 'zod';

import {
  DEFAULT_LAYOUT,
  type Density,
  type LayoutMode,
  type ThemePreference,
} from '@/config/layout';
import {
  FEATURE_FLAG_KEYS,
  type FeatureFlagKey,
  type FeatureFlags,
} from '@/lib/settings/feature-flags';

// Re-export the flag catalog + layout types (single origin — no competing defs).
export {
  FEATURE_FLAGS,
  FEATURE_FLAG_KEYS,
  DEFAULT_FLAGS,
  type FeatureFlagKey,
  type FeatureFlags,
  type FeatureFlagMeta,
} from '@/lib/settings/feature-flags';
export type { Density, LayoutMode, ThemePreference } from '@/config/layout';

// ---------------------------------------------------------------------------
// General / system settings
// ---------------------------------------------------------------------------

export const generalSettingsSchema = z.object({
  siteName: z.string().trim().min(2, 'Site adı en az 2 karakter olmalı.').max(60, 'Site adı çok uzun.'),
  supportEmail: z.string().trim().email('Geçerli bir e-posta girin.'),
  /** Locale is fixed to Turkish for now (kept as a field for future locales). */
  defaultLocale: z.literal('tr'),
  maintenanceMode: z.boolean(),
});
export type GeneralSettings = z.infer<typeof generalSettingsSchema>;

// ---------------------------------------------------------------------------
// Feature flags — a boolean for every known key (derived from the catalog)
// ---------------------------------------------------------------------------

const flagKeyEnum = z.enum(FEATURE_FLAG_KEYS as unknown as [FeatureFlagKey, ...FeatureFlagKey[]]);

/** Full flag record (every key required). */
export const featureFlagsSchema = z.object(
  Object.fromEntries(FEATURE_FLAG_KEYS.map((k) => [k, z.boolean()])) as Record<
    FeatureFlagKey,
    z.ZodBoolean
  >,
) as z.ZodType<FeatureFlags>;

// ---------------------------------------------------------------------------
// Layout defaults — mirror `LayoutConfig`'s editable subset (no double-def)
// ---------------------------------------------------------------------------

const layoutModeEnum = z.enum(['sidebar', 'topnav']) as z.ZodType<LayoutMode>;
const densityEnum = z.enum(['comfortable', 'compact']) as z.ZodType<Density>;
const themeEnum = z.enum(['light', 'dark', 'system']) as z.ZodType<ThemePreference>;

export const layoutDefaultsSchema = z.object({
  mode: layoutModeEnum,
  density: densityEnum,
  theme: themeEnum,
});
export type LayoutDefaults = z.infer<typeof layoutDefaultsSchema>;

/** Organization layout defaults, seeded from the shared `DEFAULT_LAYOUT`. */
export const DEFAULT_LAYOUT_DEFAULTS: LayoutDefaults = {
  mode: DEFAULT_LAYOUT.mode,
  density: DEFAULT_LAYOUT.density,
  theme: DEFAULT_LAYOUT.theme,
};

// ---------------------------------------------------------------------------
// Envelope + partial patch
// ---------------------------------------------------------------------------

export const settingsSchema = z.object({
  general: generalSettingsSchema,
  flags: featureFlagsSchema,
  layoutDefaults: layoutDefaultsSchema,
});
export type Settings = z.infer<typeof settingsSchema>;

/** A partial update: any subset of groups, each group partially editable. */
export const settingsPatchSchema = z
  .object({
    general: generalSettingsSchema.partial(),
    // Partial: callers may PATCH a single flag (not the exhaustive record).
    flags: z.partialRecord(flagKeyEnum, z.boolean()),
    layoutDefaults: layoutDefaultsSchema.partial(),
  })
  .partial()
  .refine((v) => v.general != null || v.flags != null || v.layoutDefaults != null, {
    message: 'En az bir ayar grubu güncellenmeli.',
  });
export type SettingsPatch = z.infer<typeof settingsPatchSchema>;

/** RHF form values for the General settings form. */
export const generalFormSchema = generalSettingsSchema;
export type GeneralFormValues = z.infer<typeof generalFormSchema>;
