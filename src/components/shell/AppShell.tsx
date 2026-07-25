import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { useLayout } from '@/lib/layout/layout-context';
import { AssistantDock } from '@/components/ai';
import { PageSkeleton } from '@/app/pages/PageSkeleton';
import { CommandPaletteProvider } from './command-palette-context';
import { CommandPalette } from './CommandPalette';
import { MobileBottomNav } from './MobileNav';
import { RouteGuard } from './RouteGuard';
import { SidebarShell } from './SidebarShell';
import { TopnavShell } from './TopnavShell';

export interface AppShellProps {
  /** Content override (tests/stories). Defaults to the router <Outlet />. */
  children?: React.ReactNode;
}

/**
 * Configurable shell — renders SidebarShell or TopnavShell from a single nav
 * schema, driven by `config.mode`, switchable at runtime without reload.
 * Both modes converge to drawer + bottom nav + command palette below `lg`.
 */
export function AppShell({ children }: AppShellProps) {
  const { config } = useLayout();
  const content = children ?? (
    <RouteGuard>
      <Suspense fallback={<PageSkeleton />}>
        <Outlet />
      </Suspense>
    </RouteGuard>
  );

  return (
    <CommandPaletteProvider>
      <div data-shell-mode={config.mode}>
        {config.mode === 'sidebar' ? (
          <SidebarShell>{content}</SidebarShell>
        ) : (
          <TopnavShell>{content}</TopnavShell>
        )}
        <MobileBottomNav />
        <CommandPalette />
        <AssistantDock />
      </div>
    </CommandPaletteProvider>
  );
}
