import * as React from 'react';
import { useController, useFormContext, type FieldValues } from 'react-hook-form';

import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { FieldHelp } from './FieldHelp';

/** Props passed to a render-function child so custom controls can bind fully. */
export interface FieldControl {
  id: string;
  name: string;
  value: unknown;
  onChange: (...event: unknown[]) => void;
  onBlur: () => void;
  ref: React.Ref<unknown>;
  disabled?: boolean;
  'aria-invalid': boolean;
  'aria-describedby': string | undefined;
}

/** Stable DOM id for a field's control, derived from its RHF name. */
export function fieldControlId(name: string): string {
  return `field-${name.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
}

export interface FormFieldProps {
  name: string;
  label: React.ReactNode;
  /** Icon help (focus-managed popover). */
  help?: React.ReactNode;
  /** Inline helper text under the control. */
  helper?: React.ReactNode;
  /** Caution note (tooltip). */
  warning?: React.ReactNode;
  /** Mark the label with a required asterisk. */
  required?: boolean;
  className?: string;
  /**
   * The control. Either a single element (cloned with field props — good for
   * Input/Textarea) or a render function receiving `FieldControl` (for custom
   * controls like Select/Combobox that use onValueChange).
   */
  children: React.ReactElement | ((field: FieldControl) => React.ReactNode);
}

/**
 * Field wrapper enforcing a help affordance. Renders label + control + help +
 * helper + error, wires `aria-describedby`/`aria-invalid`, and integrates RHF.
 * Throws in dev if neither `help`, `helper`, nor `warning` is provided.
 */
export function FormField({
  name,
  label,
  help,
  helper,
  warning,
  required,
  className,
  children,
}: FormFieldProps) {
  if (import.meta.env.DEV && help == null && helper == null && warning == null) {
    throw new Error(
      `FormField "${name}" is missing a help affordance. Provide at least one of: help, helper, or warning (see docs/FORMS_UX.md).`,
    );
  }

  const { control } = useFormContext<FieldValues>();
  const { field, fieldState } = useController({ name, control });
  // Stable, name-derived ids so FormErrorSummary can anchor to fields.
  const base = fieldControlId(name);
  const ids = {
    control: base,
    helper: `${base}-helper`,
    help: `${base}-help`,
    warning: `${base}-warning`,
    error: `${base}-error`,
  };

  const error = fieldState.error?.message;
  const describedBy =
    [
      helper != null ? ids.helper : null,
      help != null ? ids.help : null,
      warning != null ? ids.warning : null,
      error ? ids.error : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  const fieldControl: FieldControl = {
    id: ids.control,
    name: field.name,
    value: field.value,
    onChange: field.onChange,
    onBlur: field.onBlur,
    ref: field.ref,
    ...(field.disabled !== undefined ? { disabled: field.disabled } : {}),
    'aria-invalid': Boolean(error),
    'aria-describedby': describedBy,
  };

  return (
    <div className={cn('grid gap-1.5', className)} data-slot="form-field">
      <div className="flex items-center gap-1.5">
        <Label htmlFor={ids.control}>
          {label}
          {required && (
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          )}
        </Label>
        <FieldHelp help={help} warning={warning} />
      </div>

      {typeof children === 'function'
        ? children(fieldControl)
        : React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
            ...fieldControl,
          })}

      {/* Persistent, screen-reader-visible help/warning text for aria-describedby. */}
      {help != null && (
        <span id={ids.help} className="sr-only">
          {help}
        </span>
      )}
      {warning != null && (
        <span id={ids.warning} className="text-warning-foreground text-xs">
          {warning}
        </span>
      )}
      {helper != null && !error && (
        <p id={ids.helper} className="text-muted-foreground text-xs">
          {helper}
        </p>
      )}
      {error && (
        <p id={ids.error} className="text-destructive text-xs" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
