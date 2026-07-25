import { PanelLeft, PanelTop, LayoutGrid, Check } from 'lucide-react';

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
import { useFeatureFlag } from '@/lib/settings/feature-flags-store';
import type { Density, LayoutMode } from '@/config/layout';

const MODE_ICONS: Record<LayoutMode, typeof PanelLeft> = {
  sidebar: PanelLeft,
  topnav: PanelTop,
  dock: LayoutGrid,
};

const MODES: { value: LayoutMode; label: string; icon: typeof PanelLeft }[] = [
  { value: 'sidebar', label: 'Kenar çubuğu', icon: PanelLeft },
  { value: 'topnav', label: 'Üst menü', icon: PanelTop },
  { value: 'dock', label: 'Komut dock', icon: LayoutGrid },
];

const DENSITIES: { value: Density; label: string }[] = [
  { value: 'comfortable', label: 'Rahat' },
  { value: 'compact', label: 'Sıkışık' },
];

/** Switch layout mode (sidebar/topnav) and density; persists via LayoutProvider. */
export function LayoutSwitcher() {
  const { config, setMode, setDensity } = useLayout();
  const dockEnabled = useFeatureFlag('dockLayout');
  // Hide the Dock option when its flag is off (existing modes unaffected).
  const modes = dockEnabled ? MODES : MODES.filter((m) => m.value !== 'dock');
  const TriggerIcon = MODE_ICONS[config.mode];
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
          <TriggerIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Yerleşim modu</DropdownMenuLabel>
        {modes.map(({ value, label, icon: Icon }) => (
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
