import type { ReactNode } from 'react';

import { Breadcrumbs } from './Breadcrumbs';
import { TopbarActions } from './TopbarActions';

export interface TopbarProps {
  /** Leading slot (sidebar collapse trigger and/or mobile menu button). */
  left?: ReactNode;
  showBreadcrumbs?: boolean;
}

/** Top bar for the sidebar shell: leading slot + breadcrumbs + actions. */
export function Topbar({ left, showBreadcrumbs = true }: TopbarProps) {
  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border px-3 backdrop-blur sm:px-4">
      {left}
      {showBreadcrumbs && (
        <div className="hidden min-w-0 items-center gap-2 md:flex">
          <Breadcrumbs />
        </div>
      )}
      <div className="ml-auto">
        <TopbarActions />
      </div>
    </header>
  );
}
