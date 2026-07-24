import * as React from 'react';

import {
  DEFAULT_LAYOUT,
  loadLayout,
  saveLayout,
  type Density,
  type LayoutConfig,
  type LayoutMode,
  type ThemePreference,
} from '@/config/layout';

export interface LayoutContextValue {
  config: LayoutConfig;
  /** Resolved theme after applying the system preference. */
  resolvedTheme: 'light' | 'dark';
  setMode: (mode: LayoutMode) => void;
  toggleMode: () => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setDensity: (density: Density) => void;
  toggleDensity: () => void;
  setTheme: (theme: ThemePreference) => void;
}

const LayoutContext = React.createContext<LayoutContextValue | null>(null);

function prefersDark(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function resolveTheme(theme: ThemePreference, systemDark: boolean): 'light' | 'dark' {
  if (theme === 'system') return systemDark ? 'dark' : 'light';
  return theme;
}

export interface LayoutProviderProps {
  children: React.ReactNode;
  /** Override initial config (Storybook decorators, tests). */
  initialConfig?: Partial<LayoutConfig>;
  /** Skip localStorage persistence (Storybook/tests). */
  persist?: boolean;
}

export function LayoutProvider({
  children,
  initialConfig,
  persist = true,
}: LayoutProviderProps) {
  const [config, setConfig] = React.useState<LayoutConfig>(() => ({
    ...(persist ? loadLayout() : DEFAULT_LAYOUT),
    ...initialConfig,
  }));
  const [systemDark, setSystemDark] = React.useState<boolean>(prefersDark);

  // Track the OS color-scheme so `system` resolves live.
  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const resolvedTheme = resolveTheme(config.theme, systemDark);

  // Apply theme + density to the document root; persist on change.
  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.classList.toggle('dark', resolvedTheme === 'dark');
      root.dataset.density = config.density;
    }
    if (persist) saveLayout(config);
  }, [config, resolvedTheme, persist]);

  const value = React.useMemo<LayoutContextValue>(() => {
    const update = (patch: Partial<LayoutConfig>) => setConfig((c) => ({ ...c, ...patch }));
    return {
      config,
      resolvedTheme,
      setMode: (mode) => update({ mode }),
      toggleMode: () => setConfig((c) => ({ ...c, mode: c.mode === 'sidebar' ? 'topnav' : 'sidebar' })),
      toggleSidebar: () => setConfig((c) => ({ ...c, sidebarCollapsed: !c.sidebarCollapsed })),
      setSidebarCollapsed: (sidebarCollapsed) => update({ sidebarCollapsed }),
      setDensity: (density) => update({ density }),
      toggleDensity: () =>
        setConfig((c) => ({ ...c, density: c.density === 'comfortable' ? 'compact' : 'comfortable' })),
      setTheme: (theme) => update({ theme }),
    };
  }, [config, resolvedTheme]);

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
}

export function useLayout(): LayoutContextValue {
  const ctx = React.useContext(LayoutContext);
  if (!ctx) throw new Error('useLayout must be used within a LayoutProvider');
  return ctx;
}

/** Ergonomic theme selector built on the layout config. */
export function useTheme() {
  const { config, resolvedTheme, setTheme } = useLayout();
  return { theme: config.theme, resolvedTheme, setTheme };
}
