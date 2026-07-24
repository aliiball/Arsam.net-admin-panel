/**
 * Feature-flag catalog + defaults — the single source of truth for which flags
 * exist and what they default to. Lives in `lib/` (like `config/layout.ts`) so
 * both the live store and the settings feature read from ONE origin.
 *
 * A flag whose `key` matches a `useFeatureFlag(key)` call gates real behavior;
 * add the key here, wire the hook where the behavior lives, and the settings
 * screen edits it automatically.
 */
export const FEATURE_FLAG_KEYS = ['listingDetailMap', 'aiCopilotBadges'] as const;

export type FeatureFlagKey = (typeof FEATURE_FLAG_KEYS)[number];

export type FeatureFlags = Record<FeatureFlagKey, boolean>;

/** Catalog entry: key + Turkish label + one-line help (surfaced via FieldHelp). */
export interface FeatureFlagMeta {
  key: FeatureFlagKey;
  label: string;
  help: string;
}

/** The known flags, in display order (mirrors the RBAC PERMISSION_CATALOG shape). */
export const FEATURE_FLAGS: FeatureFlagMeta[] = [
  {
    key: 'listingDetailMap',
    label: 'İlan detayında harita',
    help: 'İlan detay sayfasında yaklaşık konum haritasını gösterir. Kapatıldığında harita kartı gizlenir.',
  },
  {
    key: 'aiCopilotBadges',
    label: 'AI kopilot rozetleri',
    help: 'AI ön-değerlendirme rozetlerini (OK / Belirsiz / NOK) ilan detayında gösterir.',
  },
];

/** Default flag values — every catalog flag starts enabled. */
export const DEFAULT_FLAGS: FeatureFlags = {
  listingDetailMap: true,
  aiCopilotBadges: true,
};

/** Type guard for a known flag key (used when parsing partial/legacy payloads). */
export function isFeatureFlagKey(v: unknown): v is FeatureFlagKey {
  return typeof v === 'string' && (FEATURE_FLAG_KEYS as readonly string[]).includes(v);
}

/** Clone a flag record so the runtime copy never aliases a constant. */
export function cloneFlags(flags: FeatureFlags): FeatureFlags {
  return { ...flags };
}
