/**
 * Layout configuration contract — single source of truth for shell layout.
 * Persistence is localStorage now; swap to an API later behind this same
 * interface (load/save signatures stay stable).
 */
export type LayoutMode = 'sidebar' | 'topnav' | 'dock';
export type Density = 'comfortable' | 'compact';
export type ThemePreference = 'light' | 'dark' | 'system';

export interface LayoutConfig {
  mode: LayoutMode;
  /** sidebar mode only */
  sidebarCollapsed: boolean;
  density: Density;
  theme: ThemePreference;
}

export const DEFAULT_LAYOUT: LayoutConfig = {
  // Dock ("Komut Dock") is the system default: fresh visitors (no persisted
  // `arsam.layout`) open straight into the floating command-dock shell. Falls
  // back to sidebar if the `dockLayout` feature flag is ever turned off
  // (guarded in AppShell). Also seeds the org-level layout defaults.
  mode: 'dock',
  sidebarCollapsed: false,
  density: 'comfortable',
  theme: 'system',
};

/**
 * Bumped to `.v2` when the system default flipped to `dock`. Returning visitors
 * carry a legacy `arsam.layout` with `mode:'sidebar'`; a persisted config always
 * wins over `DEFAULT_LAYOUT`, so without a key bump they'd never see the new
 * default. `loadLayout` migrates the legacy key once (keeping the user's
 * theme/density, adopting the new default mode).
 */
export const LAYOUT_STORAGE_KEY = 'arsam.layout.v2';
const LEGACY_LAYOUT_STORAGE_KEY = 'arsam.layout';

function isLayoutMode(v: unknown): v is LayoutMode {
  return v === 'sidebar' || v === 'topnav' || v === 'dock';
}
function isDensity(v: unknown): v is Density {
  return v === 'comfortable' || v === 'compact';
}
function isTheme(v: unknown): v is ThemePreference {
  return v === 'light' || v === 'dark' || v === 'system';
}

/** Parse a stored payload into a full config, tolerating partial/legacy shapes. */
function parseLayout(raw: string): LayoutConfig {
  const parsed = JSON.parse(raw) as Partial<Record<keyof LayoutConfig, unknown>>;
  return {
    mode: isLayoutMode(parsed.mode) ? parsed.mode : DEFAULT_LAYOUT.mode,
    sidebarCollapsed:
      typeof parsed.sidebarCollapsed === 'boolean'
        ? parsed.sidebarCollapsed
        : DEFAULT_LAYOUT.sidebarCollapsed,
    density: isDensity(parsed.density) ? parsed.density : DEFAULT_LAYOUT.density,
    theme: isTheme(parsed.theme) ? parsed.theme : DEFAULT_LAYOUT.theme,
  };
}

/** Load persisted layout, tolerating partial/legacy shapes. */
export function loadLayout(): LayoutConfig {
  if (typeof window === 'undefined') return DEFAULT_LAYOUT;
  try {
    const raw = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (raw) return parseLayout(raw);

    // One-time migration from the pre-dock key: keep the user's theme/density
    // but adopt the new default mode. The provider persists this under the v2
    // key on mount, so subsequent explicit mode changes stick.
    const legacy = window.localStorage.getItem(LEGACY_LAYOUT_STORAGE_KEY);
    if (legacy) return { ...parseLayout(legacy), mode: DEFAULT_LAYOUT.mode };

    return DEFAULT_LAYOUT;
  } catch {
    return DEFAULT_LAYOUT;
  }
}

/** Persist layout. No-op outside the browser. */
export function saveLayout(config: LayoutConfig): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(config));
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}
