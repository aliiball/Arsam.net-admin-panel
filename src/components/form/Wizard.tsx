import * as React from 'react';
import { FormProvider, type FieldValues, type Path, type UseFormReturn } from 'react-hook-form';
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface WizardStep<T extends FieldValues> {
  id: string;
  title: string;
  description?: string;
  /** Field names validated before leaving this step. */
  fields?: Path<T>[];
  content: React.ReactNode;
}

export interface WizardProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  steps: WizardStep<T>[];
  onComplete: (values: T) => void | Promise<void>;
  /** localStorage key for autosaving the draft. */
  draftKey?: string;
  onCancel?: () => void;
  submitLabel?: string;
}

/** Multi-step form with per-step Zod validation, autosave, and dirty-warning. */
export function Wizard<T extends FieldValues>({
  form,
  steps,
  onComplete,
  draftKey,
  onCancel,
  submitLabel = 'Tamamla',
}: WizardProps<T>) {
  const [index, setIndex] = React.useState(0);
  const [submitting, setSubmitting] = React.useState(false);
  const step = steps[index]!;
  const isLast = index === steps.length - 1;

  // Autosave draft.
  React.useEffect(() => {
    if (!draftKey) return;
    const sub = form.watch((values) => {
      try {
        window.localStorage.setItem(draftKey, JSON.stringify(values));
      } catch {
        /* ignore */
      }
    });
    return () => sub.unsubscribe();
  }, [draftKey, form]);

  // Warn on unload while dirty.
  React.useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (form.formState.isDirty && !submitting) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [form.formState.isDirty, submitting]);

  const goNext = async () => {
    const fields = step.fields;
    const valid = fields && fields.length > 0 ? await form.trigger(fields) : true;
    if (valid) setIndex((i) => Math.min(i + 1, steps.length - 1));
  };

  const goBack = () => setIndex((i) => Math.max(i - 1, 0));

  const finish = form.handleSubmit(async (values) => {
    try {
      setSubmitting(true);
      await onComplete(values);
      if (draftKey) {
        try {
          window.localStorage.removeItem(draftKey);
        } catch {
          /* ignore */
        }
      }
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <FormProvider {...form}>
      <div className="grid gap-6">
        <Stepper steps={steps} current={index} onStepClick={(i) => i < index && setIndex(i)} />

        <div className="space-y-1">
          <h2 className="text-lg font-semibold">{step.title}</h2>
          {step.description && <p className="text-muted-foreground text-sm">{step.description}</p>}
        </div>

        <div>{step.content}</div>

        <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
          <div>
            {onCancel && (
              <Button type="button" variant="ghost" onClick={onCancel} data-action="cancel" data-entity="wizard">
                Vazgeç
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {index > 0 && (
              <Button type="button" variant="outline" onClick={goBack} data-action="wizard-back" data-entity="wizard">
                Geri
              </Button>
            )}
            {isLast ? (
              <Button
                type="button"
                loading={submitting}
                onClick={() => void finish()}
                data-action="wizard-submit"
                data-entity="wizard"
              >
                {submitLabel}
              </Button>
            ) : (
              <Button type="button" onClick={() => void goNext()} data-action="wizard-next" data-entity="wizard">
                Devam
              </Button>
            )}
          </div>
        </div>
      </div>
    </FormProvider>
  );
}

function Stepper<T extends FieldValues>({
  steps,
  current,
  onStepClick,
}: {
  steps: WizardStep<T>[];
  current: number;
  onStepClick: (index: number) => void;
}) {
  return (
    <ol className="flex flex-wrap items-center gap-2" aria-label="Adımlar">
      {steps.map((step, i) => {
        const state = i < current ? 'complete' : i === current ? 'current' : 'upcoming';
        return (
          <li key={step.id} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onStepClick(i)}
              disabled={i >= current}
              aria-current={state === 'current' ? 'step' : undefined}
              className={cn(
                'flex items-center gap-2 rounded-md px-2 py-1 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring',
                state === 'complete' && 'text-foreground',
                state === 'current' && 'text-foreground font-medium',
                state === 'upcoming' && 'text-muted-foreground',
                i < current && 'hover:bg-accent cursor-pointer',
              )}
              data-action="wizard-goto-step"
              data-entity="wizard"
            >
              <span
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full border text-xs tabular-nums',
                  state === 'complete' && 'bg-primary border-primary text-primary-foreground',
                  state === 'current' && 'border-primary text-primary',
                  state === 'upcoming' && 'border-border',
                )}
              >
                {state === 'complete' ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span className="hidden md:inline">{step.title}</span>
            </button>
            {i < steps.length - 1 && <span className="text-muted-foreground" aria-hidden="true">›</span>}
          </li>
        );
      })}
    </ol>
  );
}
