import * as React from 'react';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export interface RangeValue {
  min?: number | undefined;
  max?: number | undefined;
}

export interface RangeInputProps {
  value?: RangeValue;
  onChange?: (value: RangeValue) => void;
  /** Unit suffix shown inside each field (e.g., ₺, m²). */
  unit?: string;
  minPlaceholder?: string;
  maxPlaceholder?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

const nf = new Intl.NumberFormat('tr-TR');

function formatNumber(n: number | undefined): string {
  return n === undefined || Number.isNaN(n) ? '' : nf.format(n);
}
function parseNumber(s: string): number | undefined {
  const digits = s.replace(/[^\d]/g, '');
  return digits === '' ? undefined : Number(digits);
}

/** Range-aware numeric pair (min/max) with thousands separators + tabular nums. */
export function RangeInput({
  value = {},
  onChange,
  unit,
  minPlaceholder = 'En az',
  maxPlaceholder = 'En çok',
  disabled,
  id,
  className,
  ...aria
}: RangeInputProps) {
  const emit = (patch: RangeValue) => onChange?.({ ...value, ...patch });

  const field = (
    kind: 'min' | 'max',
    placeholder: string,
    extra?: React.InputHTMLAttributes<HTMLInputElement>,
  ) => (
    <div className="relative flex-1">
      <Input
        inputMode="numeric"
        placeholder={placeholder}
        disabled={disabled}
        value={formatNumber(value[kind])}
        onChange={(e) => emit({ [kind]: parseNumber(e.target.value) })}
        className={cn('tabular-nums', unit && 'pr-9')}
        {...extra}
      />
      {unit && (
        <span className="text-muted-foreground pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs">
          {unit}
        </span>
      )}
    </div>
  );

  return (
    <div
      className={cn('flex items-center gap-2', className)}
      role="group"
      aria-invalid={aria['aria-invalid']}
      aria-describedby={aria['aria-describedby']}
    >
      {field('min', minPlaceholder, { id, 'aria-label': `${minPlaceholder}` })}
      <span className="text-muted-foreground" aria-hidden="true">
        –
      </span>
      {field('max', maxPlaceholder, { 'aria-label': `${maxPlaceholder}` })}
    </div>
  );
}
