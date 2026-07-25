import type { ReactNode } from 'react';

import { Brand } from './Brand';
import { Breadcrumbs } from './Breadcrumbs';
import { TopbarActions } from './TopbarActions';
import { TopnavMenu } from './TopnavMenu';
import { MobileDrawer } from './MobileNav';
import { usePermittedNav } from './nav-utils';

/** Topnav layout: sidebar-less horizontal nav (xl+, i.e. 1024) with overflow + content. */
export function TopnavShell({ children }: { children: ReactNode }) {
  const nav = usePermittedNav();

  return (
    <div className="flex min-h-svh flex-col">
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-30 border-b border-border backdrop-blur">
        <div className="flex h-14 items-center gap-3 px-3 md:px-4">
          <MobileDrawer />
          <Brand />
          <nav className="hidden min-w-0 flex-1 xl:flex" aria-label="Ana gezinme" data-testid="topnav">
            <TopnavMenu items={nav} />
          </nav>
          <div className="ml-auto shrink-0">
            <TopbarActions />
          </div>
        </div>
        <div className="hidden h-9 items-center border-t border-border/60 px-4 lg:flex">
          <Breadcrumbs />
        </div>
      </header>

      <main className="flex-1 overflow-x-hidden p-4 pb-20 xl:pb-6" data-density-scope>
        {children}
      </main>
    </div>
  );
}
