import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, Moon, PanelLeft, PanelTop, Rows3, Sun } from 'lucide-react';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { useLayout } from '@/lib/layout/layout-context';
import { flattenNav, navSchema } from '@/config/nav-schema';
import { useSession } from '@/lib/permissions/permission-context';
import { filterNavByRole } from './nav-utils';
import { useCommandPalette } from './command-palette-context';

/**
 * Cmd/Ctrl-K palette — navigate to any permitted module + run quick actions.
 * Provides full module parity on every surface (desktop shells + mobile).
 */
export function CommandPalette() {
  const { open, setOpen } = useCommandPalette();
  const navigate = useNavigate();
  const { user } = useSession();
  const { setMode, setTheme, toggleDensity } = useLayout();

  const navItems = useMemo(
    () => flattenNav(filterNavByRole(navSchema, user.role)),
    [user.role],
  );

  const run = (fn: () => void) => {
    fn();
    setOpen(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Modül ara veya komut yaz…" data-action="search" data-entity="command" />
      <CommandList>
        <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
        <CommandGroup heading="Modüller">
          {navItems.map((item) => (
            <CommandItem
              key={`${item.id}-${item.to}`}
              value={`${item.label} ${item.to}`}
              onSelect={() => run(() => navigate(item.to))}
              data-action="navigate"
              data-entity={item.aiEntity ?? 'module'}
            >
              <item.icon className="size-4" />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Hızlı Aksiyonlar">
          <CommandItem onSelect={() => run(() => setMode('sidebar'))} data-action="set-layout-mode" data-entity="layout">
            <PanelLeft className="size-4" /> Kenar çubuğu moduna geç
          </CommandItem>
          <CommandItem onSelect={() => run(() => setMode('topnav'))} data-action="set-layout-mode" data-entity="layout">
            <PanelTop className="size-4" /> Üst menü moduna geç
          </CommandItem>
          <CommandItem onSelect={() => run(() => toggleDensity())} data-action="toggle-density" data-entity="layout">
            <Rows3 className="size-4" /> Yoğunluğu değiştir
          </CommandItem>
          <CommandItem onSelect={() => run(() => setTheme('light'))} data-action="set-theme" data-entity="layout">
            <Sun className="size-4" /> Aydınlık tema
          </CommandItem>
          <CommandItem onSelect={() => run(() => setTheme('dark'))} data-action="set-theme" data-entity="layout">
            <Moon className="size-4" /> Koyu tema
          </CommandItem>
          <CommandItem onSelect={() => run(() => setTheme('system'))} data-action="set-theme" data-entity="layout">
            <Monitor className="size-4" /> Sistem teması
            <CommandShortcut>⌘K</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
