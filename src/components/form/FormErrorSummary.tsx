import { useFormContext, type FieldErrors } from 'react-hook-form';
import { AlertCircle } from 'lucide-react';

import { cn } from '@/lib/utils';
import { fieldControlId } from './FormField';

/** Flatten nested RHF errors into { name, message } leaves. */
function collectErrors(errors: FieldErrors, prefix = ''): { name: string; message: string }[] {
  const out: { name: string; message: string }[] = [];
  for (const [key, value] of Object.entries(errors)) {
    if (!value) continue;
    const name = prefix ? `${prefix}.${key}` : key;
    if (typeof (value as { message?: unknown }).message === 'string') {
      out.push({ name, message: (value as { message: string }).message });
    } else if (typeof value === 'object') {
      out.push(...collectErrors(value as FieldErrors, name));
    }
  }
  return out;
}

export interface FormErrorSummaryProps {
  className?: string;
  title?: string;
  /** Map of field name -> human label for nicer summary text. */
  labels?: Record<string, string>;
}

/**
 * Error summary with anchor links to invalid fields. Renders only after a
 * failed submit (formState.isSubmitted) with at least one error.
 */
export function FormErrorSummary({ className, title = 'Lütfen şu alanları düzeltin:', labels }: FormErrorSummaryProps) {
  const { formState } = useFormContext();
  if (!formState.isSubmitted) return null;
  const errors = collectErrors(formState.errors);
  if (errors.length === 0) return null;

  const focusField = (name: string) => {
    const el = document.getElementById(fieldControlId(name));
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      (el as HTMLElement).focus?.();
    }
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn('rounded-lg border border-destructive/30 bg-destructive/5 p-4', className)}
      data-slot="form-error-summary"
    >
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <AlertCircle className="size-4 text-destructive" aria-hidden="true" />
        {title}
      </div>
      <ul className="mt-2 space-y-1 text-sm">
        {errors.map((err) => (
          <li key={err.name}>
            <a
              href={`#${fieldControlId(err.name)}`}
              onClick={(e) => {
                e.preventDefault();
                focusField(err.name);
              }}
              className="text-destructive underline underline-offset-2 hover:opacity-80"
              data-action="focus-field"
              data-entity="field"
            >
              {labels?.[err.name] ?? err.name}: {err.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
