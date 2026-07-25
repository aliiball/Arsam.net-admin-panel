import type { ReactNode } from 'react';
import { Search } from 'lucide-react';

import { useFeatureFlag } from '@/lib/settings/feature-flags-store';
import { CommandDock } from './CommandDock';
import { DockLogo } from './DockLogo';
import { NotificationBell } from './NotificationBell';
import { UserMenu } from './UserMenu';
import { useCommandPalette } from './command-palette-context';

export interface DockShellProps {
  children: ReactNode;
  /** Injected clock for deterministic stories/tests (threaded to the dock). */
  now?: Date | undefined;
}

/**
 * `dock` layout: no persistent sidebar/topnav. Content is full-width; a floating
 * rich-glass command dock sits top-center (xl+). Below xl it converges to a
 * floating rounded command pill (launcher + notifications + user menu) plus the
 * shared bottom nav — Golden Rule 3. Full navigation stays reachable via the ⌘K
 * card-grid launcher (opened from the pill or the bottom nav), so no separate
 * drawer is needed in this mode. Fed by the same nav schema as the other shells.
 */
export function DockShell({ children, now }: DockShellProps) {
  const { setOpen } = useCommandPalette();
  const notificationsEnabled = useFeatureFlag('notificationCenter');

  return (
    <div className="flex min-h-svh flex-col">
      {/* Mobile command pill (below xl) — floating, rounded, rich glass. */}
      <div
        className="bg-glass text-glass-foreground border-glass-border fixed inset-x-4 top-3 z-40 flex h-14 items-center gap-2 rounded-full border px-2 shadow-lg backdrop-blur-md xl:hidden"
        aria-label="Komut çubuğu"
        data-entity="dock"
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-full pl-1.5 pr-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2"
          aria-label="Menü ve komut aramayı aç"
          aria-keyshortcuts="Meta+K Control+K"
          data-action="open-command-palette"
          data-entity="command"
        >
          <DockLogo className="size-8" />
          <span className="truncate">arsam</span>
          <Search className="text-muted-foreground ml-auto size-4 shrink-0" aria-hidden />
        </button>
        <div className="flex shrink-0 items-center gap-0.5">
          {notificationsEnabled && <NotificationBell />}
          <UserMenu />
        </div>
      </div>

      {/* Floating dock (xl+). */}
      <CommandDock now={now} />

      <main className="flex-1 overflow-x-hidden p-4 pb-20 pt-20 xl:pb-6" data-density-scope>
        {children}
      </main>
    </div>
  );
}
