import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form } from '@/components/form/form-context';
import { FormField } from '@/components/form/FormField';
import { REPORT_ACTION_LABELS } from '../data/reports';
import { reasonFormSchema, type ReportActionInput } from '../schemas/report';

type ButtonVariant = React.ComponentProps<typeof Button>['variant'];

/** Only the reason-required tiers open a dialog; `resolve` (OK) is a plain button. */
type DialogAction = 'dismiss' | 'escalate';

const ACTION_META: Record<DialogAction, { variant: ButtonVariant; title: string; description: string; help: string }> = {
  dismiss: {
    variant: 'destructive',
    title: 'Şikayeti reddet',
    description: 'Şikayet geçersiz sayılır ve kapatılır. Gerekçe denetim kaydına yazılır.',
    help: 'Reddetme nedenini açıkça belirtin; karar denetim kaydına kalıcı olarak yazılır.',
  },
  escalate: {
    variant: 'outline',
    title: 'Şikayeti üst mercie taşı',
    description: 'Şikayet üst mercie iletilir. Gerekçe denetim kaydına yazılır.',
    help: 'Neden üst mercie taşındığını açıklayın; ilgili ekip için not olarak kalır.',
  },
};

export interface ReportActionDialogProps {
  action: DialogAction;
  onConfirm: (input: ReportActionInput) => void | Promise<void>;
  disabled?: boolean;
  /** Override the trigger button label (defaults to the action label). */
  triggerLabel?: string;
}

/**
 * Reason-capturing action dialog for dismiss/escalate (both require a reason).
 * The field uses FormField so the help affordance is enforced. Used for bulk
 * moderation; the detail page uses the popover-based ReportDecision instead.
 */
export function ReportActionDialog({ action, onConfirm, disabled = false, triggerLabel }: ReportActionDialogProps) {
  const meta = ACTION_META[action];
  const [open, setOpen] = useState(false);
  const form = useForm<{ reason: string }>({
    resolver: zodResolver(reasonFormSchema),
    mode: 'onBlur',
    defaultValues: { reason: '' },
  });

  useEffect(() => {
    if (open) form.reset({ reason: '' });
  }, [open, form]);

  const submit = form.handleSubmit(async (values) => {
    await onConfirm({ action, reason: values.reason.trim() });
    setOpen(false);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={meta.variant} disabled={disabled} data-action={action} data-entity="report">
          {triggerLabel ?? REPORT_ACTION_LABELS[action]}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{meta.title}</DialogTitle>
          <DialogDescription>{meta.description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            <FormField name="reason" label="Gerekçe" help={meta.help} helper="En az 5 karakter." required>
              <Textarea rows={3} placeholder="Gerekçeyi yazın…" data-action="edit-field" data-entity="report" />
            </FormField>
            <DialogFooter className="mt-4">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Vazgeç
              </Button>
              <Button
                type="submit"
                variant={meta.variant === 'destructive' ? 'destructive' : 'default'}
                loading={form.formState.isSubmitting}
                data-action={`confirm-${action}`}
                data-entity="report"
              >
                {REPORT_ACTION_LABELS[action]}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
