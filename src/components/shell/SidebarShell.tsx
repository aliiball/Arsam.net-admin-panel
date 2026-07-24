import type { ReactNode } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useLayout } from '@/lib/layout/layout-context';
import { Brand } from './Brand';
import { NavTree } from './NavTree';
import { Topbar } from './Topbar';
import { MobileDrawer } from './MobileNav';
import { usePermittedNav } from './nav-utils';

/** Sidebar layout: collapsible aside (lg+) + top bar + content. */
export function SidebarShell({ children }: { children: ReactNode }) {
  const { config, toggleSidebar } = useLayout();
  const nav = usePermittedNav();
  const collapsed = config.sidebarCollapsed;

  return (
    <div className="flex min-h-svh">
      <aside
        data-testid="sidebar"
        data-collapsed={collapsed}
        className={cn(
          'bg-sidebar hidden shrink-0 flex-col border-r border-sidebar-border transition-[width] duration-200 lg:flex',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        <div className={cn('flex h-14 items-center border-b border-sidebar-border px-3', collapsed && 'justify-center px-0')}>
          <Brand compact={collapsed} />
        </div>
        <ScrollArea className="flex-1 px-3 py-3">
          <NavTree items={nav} collapsed={collapsed} />
        </ScrollArea>
        <div className="border-t border-sidebar-border p-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-full"
                onClick={toggleSidebar}
                aria-label={collapsed ? 'Kenar çubuğunu genişlet' : 'Kenar çubuğunu daralt'}
                aria-pressed={collapsed}
                data-action="toggle-sidebar"
                data-entity="layout"
              >
                {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">{collapsed ? 'Genişlet' : 'Daralt'}</TooltipContent>
          </Tooltip>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar left={<MobileDrawer />} />
        <main className="flex-1 overflow-x-hidden p-4 pb-20 lg:pb-6" data-density-scope>
          {children}
        </main>
      </div>
    </div>
  );
}
