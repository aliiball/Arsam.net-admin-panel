/**
 * Layout configuration contract — single source of truth for shell layout.
 * Persistence is localStorage now; swap to an API later behind this same
 * interface (load/save signatures stay stable).
 */
export type LayoutMode = 'sidebar' | 'topnav';
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
  mode: 'sidebar',
  sidebarCollapsed: false,
  density: 'comfortable',
  theme: 'system',
};

export const LAYOUT_STORAGE_KEY = 'arsam.layout';

function isLayoutMode(v: unknown): v is LayoutMode {
  return v === 'sidebar' || v === 'topnav';
}
function isDensity(v: unknown): v is Density {
  return v === 'comfortable' || v === 'compact';
}
function isTheme(v: unknown): v is ThemePreference {
  return v === 'light' || v === 'dark' || v === 'system';
}

/** Load persisted layout, tolerating partial/legacy shapes. */
export function loadLayout(): LayoutConfig {
  if (typeof window === 'undefined') return DEFAULT_LAYOUT;
  try {
    const raw = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (!raw) return DEFAULT_LAYOUT;
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
