import { PanelLeft, PanelTop, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLayout } from '@/lib/layout/layout-context';
import type { Density, LayoutMode } from '@/config/layout';

const MODES: { value: LayoutMode; label: string; icon: typeof PanelLeft }[] = [
  { value: 'sidebar', label: 'Kenar çubuğu', icon: PanelLeft },
  { value: 'topnav', label: 'Üst menü', icon: PanelTop },
];

const DENSITIES: { value: Density; label: string }[] = [
  { value: 'comfortable', label: 'Rahat' },
  { value: 'compact', label: 'Sıkışık' },
];

/** Switch layout mode (sidebar/topnav) and density; persists via LayoutProvider. */
export function LayoutSwitcher() {
  const { config, setMode, setDensity } = useLayout();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Yerleşimi değiştir"
          data-action="open-layout-switcher"
          data-entity="layout"
        >
          {config.mode === 'sidebar' ? <PanelLeft className="size-4" /> : <PanelTop className="size-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Yerleşim modu</DropdownMenuLabel>
        {MODES.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            onSelect={() => setMode(value)}
            data-action="set-layout-mode"
            data-entity="layout"
          >
            <Icon className="size-4" />
            {label}
            {config.mode === value && <Check className="ml-auto size-4" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Yoğunluk</DropdownMenuLabel>
        {DENSITIES.map(({ value, label }) => (
          <DropdownMenuItem
            key={value}
            onSelect={() => setDensity(value)}
            data-action="set-density"
            data-entity="layout"
          >
            {label}
            {config.density === value && <Check className="ml-auto size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
