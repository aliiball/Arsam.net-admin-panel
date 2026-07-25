import { useLocation, useMatches } from 'react-router-dom';
import { LayoutDashboard, MoreHorizontal } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { hasRouteMeta } from '@/app/route-meta';
import { useFeatureFlag } from '@/lib/settings/feature-flags-store';
import { DockLogo } from './DockLogo';
import { NotificationBell } from './NotificationBell';
import { UserMenu } from './UserMenu';
import { usePermittedNav, isNavItemActive } from './nav-utils';
import { useCommandPalette } from './command-palette-context';

/** How many top-level modules the hover strip shows before an overflow chip. */
const INLINE_NAV_LIMIT = 6;

export interface CommandDockProps {
  /**
   * Reserved for a deterministic clock. The dock no longer renders a clock
   * (decluttered — the active page now leads the pill), but the prop stays so
   * DockShell/AppShell keep a stable signature if the clock returns elsewhere.
   */
  now?: Date | undefined;
  className?: string;
}

/**
 * Floating command dock — the chrome-light nav surface for `dock` mode. A
 * minimal top-center rich-glass pill: brand mark + the ACTIVE page (icon +
 * label) + ⌘K, with a hover-reveal inline nav strip; notification center + user
 * menu sit on the right. Desktop only (xl+); on phones the DockShell renders a
 * top command bar and the bottom nav takes over.
 */
export function CommandDock({ className }: CommandDockProps) {
  const { open, setOpen } = useCommandPalette();
  const notificationsEnabled = useFeatureFlag('notificationCenter');
  const nav = usePermittedNav();
  const { pathname } = useLocation();
  const matches = useMatches();
  const inlineItems = nav.slice(0, INLINE_NAV_LIMIT);
  const overflow = nav.length - inlineItems.length;

  // Active page for the collapsed pill: precise route title (same source as the
  // breadcrumbs) for the label, and the matching module's icon for the glyph.
  const activeItem = nav.find((i) => isNavItemActive(i.to, pathname));
  const activeCrumb = matches.filter((m) => hasRouteMeta(m.handle)).at(-1);
  const activeLabel =
    (activeCrumb && hasRouteMeta(activeCrumb.handle) ? activeCrumb.handle.routeMeta.title : undefined) ??
    activeItem?.label ??
    'Panel';
  const ActiveIcon = activeItem?.icon ?? LayoutDashboard;

  return (
    <div
      className={cn(
        'bg-glass text-glass-foreground border-glass-border fixed left-1/2 top-3 z-40 hidden max-w-[min(92vw,52rem)] -translate-x-1/2 items-center gap-2 rounded-full border px-2 py-1.5 shadow-lg backdrop-blur-md transition-[opacity,transform] duration-[var(--duration-base)] ease-[var(--ease-emphasized)] xl:flex',
        // Palette open → the pill retracts (fades + shrinks) so the command center
        // reads as morphing out of it, not as a separate centered modal.
        open && 'pointer-events-none scale-95 opacity-0',
        className,
      )}
      aria-label="Komut çubuğu"
      data-entity="dock"
    >
      {/* Launcher + hover-reveal inline nav share one `group` so hovering either
          keeps the strip open; the strip also reveals on keyboard focus-within. */}
      <div className="group flex min-w-0 items-center">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex min-h-11 min-w-0 shrink-0 items-center gap-2 rounded-full pl-1.5 pr-2.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2"
          aria-label={`${activeLabel} — menü ve komut aramayı aç`}
          aria-keyshortcuts="Meta+K Control+K"
          data-action="open-command-palette"
          data-entity="command"
        >
          <DockLogo className="size-7 shrink-0" />
          <ActiveIcon className="text-primary size-4 shrink-0" aria-hidden />
          <span className="max-w-40 truncate">{activeLabel}</span>
          <kbd className="bg-background/40 text-muted-foreground pointer-events-none ml-0.5 select-none rounded border border-glass-border px-1.5 font-mono text-[0.625rem]">
            ⌘K
          </kbd>
        </button>

        {/* Inline module dots — collapsed to width 0, spring out on hover/focus.
            Reduced-motion zeroes the transition globally, so they simply appear. */}
        <nav
          aria-label="Hızlı gezinme"
          className="pointer-events-none flex max-w-0 items-center overflow-hidden opacity-0 transition-[max-width,opacity] duration-[var(--duration-slow)] ease-[var(--ease-emphasized)] group-focus-within:pointer-events-auto group-focus-within:max-w-96 group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:max-w-96 group-hover:opacity-100"
        >
          <span className="mx-1.5 h-5 w-px shrink-0 bg-glass-border/70" aria-hidden />
          {/* gap-3 so each 44px hit area (size-8 dot + before:-inset-1.5) stays
              non-overlapping — WCAG 2.5.8 / the project's 44px touch-target rule. */}
          <ul className="flex items-center gap-3">
            {inlineItems.map((item) => {
              const active = isNavItemActive(item.to, pathname);
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  {/* Clicking a dot opens the command center (it does NOT navigate) —
                      the strip is a preview; navigation happens inside the palette.
                      On hover/focus the dot expands rightward to reveal the module
                      name (attached slide-out). `before:-inset-1.5` keeps a 44px hit
                      area around the collapsed 32px glyph. */}
                  <button
                    type="button"
                    onClick={() => setOpen(true)}
                    aria-label={item.label}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'group/dot focus-visible:ring-ring relative inline-flex h-8 items-center rounded-full outline-none transition-[background-color,color] duration-[var(--duration-base)] before:absolute before:-inset-1.5 before:content-[""] focus-visible:ring-2',
                      active
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    )}
                    data-action="open-command-palette"
                    data-entity={item.aiEntity ?? 'module'}
                  >
                    <span className="grid size-8 shrink-0 place-items-center">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span
                      aria-hidden
                      className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-medium opacity-0 transition-[max-width,opacity,padding] duration-[var(--duration-base)] ease-[var(--ease-emphasized)] group-hover/dot:max-w-32 group-hover/dot:pr-2.5 group-hover/dot:opacity-100 group-focus-visible/dot:max-w-32 group-focus-visible/dot:pr-2.5 group-focus-visible/dot:opacity-100"
                    >
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
            {overflow > 0 && (
              <li>
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring relative inline-flex size-8 items-center justify-center rounded-full outline-none transition-colors before:absolute before:-inset-1.5 before:content-[''] focus-visible:ring-2"
                  aria-label={`${overflow} modül daha — komut merkezini aç`}
                  data-action="open-command-palette"
                  data-entity="command"
                >
                  <MoreHorizontal className="size-4" aria-hidden />
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>

      {/* Thin divider, then the always-visible controls (notifications + user). */}
      <Separator orientation="vertical" className="h-6 bg-glass-border/60" />
      <div className="flex shrink-0 items-center gap-1">
        {notificationsEnabled && <NotificationBell />}
        <UserMenu />
      </div>
    </div>
  );
}
