import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FieldHelp } from '@/components/form/FieldHelp';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MonitorSmartphone } from 'lucide-react';
import type { Density, LayoutDefaults, LayoutMode, ThemePreference } from '../schemas/settings';

export interface LayoutDefaultsFormProps {
  value: LayoutDefaults;
  onChange: (patch: Partial<LayoutDefaults>) => void;
  /** Push these defaults into the current device's live layout (layout-context). */
  onApplyToDevice?: () => void;
  disabled?: boolean;
}

const MODE_LABELS: Record<LayoutMode, string> = { sidebar: 'Kenar çubuğu', topnav: 'Üst menü', dock: 'Komut dock' };
const DENSITY_LABELS: Record<Density, string> = { comfortable: 'Ferah', compact: 'Sıkışık' };
const THEME_LABELS: Record<ThemePreference, string> = { light: 'Açık', dark: 'Koyu', system: 'Sistem' };

interface RowProps {
  id: string;
  label: string;
  help: string;
  children: React.ReactNode;
}
/**
 * Label + FieldHelp affordance + control. Renders a persistent, id'd sr-only
 * help span (`${id}-help`) so each `SelectTrigger` can point `aria-describedby`
 * at it — replicating what `FormField` wires for RHF-bound fields.
 */
function Row({ id, label, help, children }: RowProps) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-center gap-1.5">
        <Label htmlFor={id}>{label}</Label>
        <FieldHelp help={help} label={`${label} hakkında`} />
      </div>
      {children}
      <span id={`${id}-help`} className="sr-only">
        {help}
      </span>
    </div>
  );
}

/**
 * Organization layout DEFAULTS (mode/density/theme). These are the org-level
 * seed values persisted via settings — NOT the user's live layout preference,
 * which stays owned by `layout-context`. "Bu cihaza uygula" pushes the defaults
 * into the live layout on demand (single source stays the layout-context).
 */
export function LayoutDefaultsForm({ value, onChange, onApplyToDevice, disabled }: LayoutDefaultsFormProps) {
  return (
    <div className="space-y-4" data-entity="settings">
      <Row id="layout-mode" label="Varsayılan yerleşim" help="Yeni kullanıcılar için varsayılan yerleşim modu.">
        <Select
          value={value.mode}
          disabled={disabled ?? false}
          onValueChange={(v) => onChange({ mode: v as LayoutMode })}
        >
          <SelectTrigger id="layout-mode" aria-label="Varsayılan yerleşim" aria-describedby="layout-mode-help">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(MODE_LABELS) as LayoutMode[]).map((m) => (
              <SelectItem key={m} value={m}>
                {MODE_LABELS[m]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Row>

      <Row id="layout-density" label="Varsayılan yoğunluk" help="Arayüz sıklığı: ferah daha büyük, sıkışık daha küçük.">
        <Select
          value={value.density}
          disabled={disabled ?? false}
          onValueChange={(v) => onChange({ density: v as Density })}
        >
          <SelectTrigger id="layout-density" aria-label="Varsayılan yoğunluk" aria-describedby="layout-density-help">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(DENSITY_LABELS) as Density[]).map((d) => (
              <SelectItem key={d} value={d}>
                {DENSITY_LABELS[d]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Row>

      <Row id="layout-theme" label="Varsayılan tema" help="Açık, koyu ya da işletim sistemine uyan tema.">
        <Select
          value={value.theme}
          disabled={disabled ?? false}
          onValueChange={(v) => onChange({ theme: v as ThemePreference })}
        >
          <SelectTrigger id="layout-theme" aria-label="Varsayılan tema" aria-describedby="layout-theme-help">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(THEME_LABELS) as ThemePreference[]).map((t) => (
              <SelectItem key={t} value={t}>
                {THEME_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Row>

      {onApplyToDevice && (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 p-3">
          <p className="text-muted-foreground text-xs">
            Bu varsayılanlar organizasyon geneli için saklanır. Kendi cihazınızda hemen denemek için uygulayın.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled ?? false}
            onClick={onApplyToDevice}
            data-action="apply-layout-defaults"
            data-entity="settings"
          >
            <MonitorSmartphone className="size-4" /> Bu cihaza uygula
          </Button>
        </div>
      )}
    </div>
  );
}
