import { useId, type ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { Combobox, type ComboboxOption } from '@/components/ui/combobox';
import { FieldHelp } from './FieldHelp';

export interface CascadeLevel {
  key: string;
  label: string;
  placeholder?: string;
  /** Options for this level given the currently selected ancestor values. */
  getOptions: (selected: Record<string, string>) => ComboboxOption[];
}

export type CascadeValue = Record<string, string>;

export interface CascadingSelectProps {
  levels: CascadeLevel[];
  value?: CascadeValue;
  onChange?: (value: CascadeValue) => void;
  disabled?: boolean;
  className?: string;
  /** Group label rendered above the cascade. */
  label?: ReactNode;
  /** Help affordance (wired to every level via aria-describedby). */
  help?: ReactNode;
  /** Per-level error messages (keyed by level.key). */
  errors?: Record<string, string | undefined>;
}

/**
 * Dependent selects (e.g., il → ilçe → mahalle). A child is disabled until its
 * parent is chosen; selecting a parent resets all descendant values. Each level
 * is wired to the shared help + its own error via aria-describedby/aria-invalid.
 */
export function CascadingSelect({
  levels,
  value = {},
  onChange,
  disabled,
  className,
  label,
  help,
  errors,
}: CascadingSelectProps) {
  const helpId = useId();

  const handleChange = (index: number, key: string, next: string) => {
    const updated: CascadeValue = { ...value, [key]: next };
    for (let i = index + 1; i < levels.length; i += 1) {
      const level = levels[i];
      if (level) delete updated[level.key];
    }
    onChange?.(updated);
  };

  return (
    <div className="space-y-2">
      {(label || help) && (
        <div className="flex items-center gap-1.5">
          {label && <span className="text-sm font-medium">{label}</span>}
          {help != null && <FieldHelp help={help} />}
        </div>
      )}
      {help != null && (
        <span id={helpId} className="sr-only">
          {help}
        </span>
      )}
      <div className={cn('grid gap-3 sm:grid-cols-3', className)}>
        {levels.map((level, index) => {
          const parent = index > 0 ? levels[index - 1] : undefined;
          const parentChosen = !parent || Boolean(value[parent.key]);
          const options = parentChosen ? level.getOptions(value) : [];
          const error = errors?.[level.key];
          const errorId = `${helpId}-${level.key}-error`;
          const describedBy = [help != null ? helpId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;
          return (
            <div key={level.key} className="grid gap-1.5">
              <span className="text-muted-foreground text-xs">{level.label}</span>
              <Combobox
                options={options}
                value={value[level.key] ?? ''}
                onValueChange={(v) => handleChange(index, level.key, v)}
                placeholder={level.placeholder ?? level.label}
                disabled={disabled || !parentChosen}
                aria-label={level.label}
                {...(describedBy ? { 'aria-describedby': describedBy } : {})}
                {...(error ? { 'aria-invalid': true } : {})}
              />
              {error && (
                <p id={errorId} className="text-destructive text-xs" role="alert">
                  {error}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
