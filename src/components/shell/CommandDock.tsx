import { Search } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useFeatureFlag } from '@/lib/settings/feature-flags-store';
import { ContextPill } from './ContextPill';
import { DockLogo } from './DockLogo';
import { NotificationBell } from './NotificationBell';
import { UserMenu } from './UserMenu';
import { useCommandPalette } from './command-palette-context';

export interface CommandDockProps {
  /** Injected clock for deterministic stories/tests (threaded to ContextPill). */
  now?: Date | undefined;
  className?: string;
}

/**
 * Floating command dock — the chrome-light nav surface for `dock` mode. A
 * top-center rich-glass bar: Arsam launcher (opens the ⌘K launcher) + context
 * pill (active page + clock) + notification center. Desktop only (xl+); on
 * phones the DockShell renders a top command bar and the bottom nav takes over.
 */
export function CommandDock({ now, className }: CommandDockProps) {
  const { setOpen } = useCommandPalette();
  const notificationsEnabled = useFeatureFlag('notificationCenter');

  return (
    <div
      className={cn(
        'bg-glass text-glass-foreground border-glass-border fixed left-1/2 top-3 z-40 hidden max-w-[min(92vw,44rem)] -translate-x-1/2 items-center gap-2 rounded-full border px-2 py-1.5 shadow-lg backdrop-blur-md xl:flex',
        className,
      )}
      aria-label="Komut çubuğu"
      data-entity="dock"
    >
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex min-h-11 items-center gap-2 rounded-full pl-2 pr-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2"
        aria-label="Menü ve komut aramayı aç"
        aria-keyshortcuts="Meta+K Control+K"
        data-action="open-command-palette"
        data-entity="command"
      >
        <DockLogo className="size-7" />
        <span>arsam</span>
        <Search className="text-muted-foreground size-4" aria-hidden />
        <kbd className="bg-background/40 text-muted-foreground pointer-events-none select-none rounded border border-glass-border px-1.5 font-mono text-[0.625rem]">
          ⌘K
        </kbd>
      </button>

      {/* Lighter divider so the launcher stays the primary entry point. */}
      <Separator orientation="vertical" className="h-6 bg-glass-border/60" />

      <ContextPill now={now} className="px-1" />

      <Separator orientation="vertical" className="h-6 bg-glass-border" />
      <div className="flex items-center gap-1">
        {notificationsEnabled && <NotificationBell />}
        <UserMenu />
      </div>
    </div>
  );
}
