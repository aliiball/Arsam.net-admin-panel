import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, Search } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Brand } from './Brand';
import { NavTree } from './NavTree';
import { usePermittedNav, usePrimaryNav, isNavItemActive } from './nav-utils';
import { useCommandPalette } from './command-palette-context';
import { useLocation } from 'react-router-dom';

/** Hamburger + full-nav drawer. Placed in the shell's mobile leading slot (lg:hidden). */
export function MobileDrawer() {
  const [open, setOpen] = useState(false);
  const nav = usePermittedNav();
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Menüyü aç"
          data-action="open-mobile-drawer"
          data-entity="navigation"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b border-border">
          <SheetTitle asChild>
            <Brand />
          </SheetTitle>
          <SheetDescription className="sr-only">Ana gezinme menüsü</SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100svh-4rem)] px-3 py-3">
          <NavTree items={nav} onNavigate={() => setOpen(false)} />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

/** Fixed bottom navigation (<=5 primary items) + palette shortcut. Visible below lg. */
export function MobileBottomNav() {
  const primary = usePrimaryNav(4);
  const { pathname } = useLocation();
  const { setOpen } = useCommandPalette();

  return (
    <nav
      className="bg-background fixed inset-x-0 bottom-0 z-30 flex h-16 items-stretch border-t border-border lg:hidden"
      aria-label="Alt gezinme"
    >
      {primary.map((item) => {
        const active = isNavItemActive(item.to, pathname);
        const Icon = item.icon;
        return (
          <NavLink
            key={item.id}
            to={item.to}
            end={item.to === '/'}
            aria-current={active ? 'page' : undefined}
            data-action="navigate"
            data-entity={item.aiEntity ?? 'module'}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 text-[0.6875rem] outline-none',
              active ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
            <span className="max-w-full truncate px-1">{item.label.split(' ')[0]}</span>
          </NavLink>
        );
      })}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-muted-foreground flex flex-1 flex-col items-center justify-center gap-0.5 text-[0.6875rem] outline-none"
        aria-label="Komut paletini aç"
        data-action="open-command-palette"
        data-entity="command"
      >
        <Search className="size-5" aria-hidden="true" />
        <span>Ara</span>
      </button>
    </nav>
  );
}
