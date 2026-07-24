import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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
import { USER_ACTION_LABELS, type UserActionType } from '../data/users';
import { reasonFormSchema, type UserActionInput } from '../schemas/user';

type ButtonVariant = React.ComponentProps<typeof Button>['variant'];

const ACTION_META: Record<
  Exclude<UserActionType, 'verify'>,
  { variant: ButtonVariant; reasonRequired: boolean; title: string; description: string; help: string }
> = {
  suspend: {
    variant: 'outline',
    reasonRequired: true,
    title: 'Kullanıcıyı askıya al',
    description: 'Kullanıcı geçici olarak askıya alınır. Gerekçe denetim kaydına yazılır.',
    help: 'Askıya alma nedenini açıkça belirtin; kullanıcıya ve denetim kaydına yansır.',
  },
  ban: {
    variant: 'destructive',
    reasonRequired: true,
    title: 'Kullanıcıyı yasakla',
    description: 'Kullanıcı kalıcı olarak yasaklanır. Gerekçe denetim kaydına yazılır.',
    help: 'Yasaklama nedenini açıkça belirtin; bu işlem denetim kaydına kalıcı olarak yazılır.',
  },
  unban: {
    variant: 'outline',
    reasonRequired: false,
    title: 'Yasağı kaldır',
    description: 'Kullanıcının yasağı/askısı kaldırılır ve hesap yeniden aktifleşir.',
    help: 'İsteğe bağlı: yasağın neden kaldırıldığını not düşebilirsiniz.',
  },
};

const optionalReasonSchema = z.object({ reason: z.string() });

export interface UserActionDialogProps {
  action: Exclude<UserActionType, 'verify'>;
  onConfirm: (input: UserActionInput) => void | Promise<void>;
  disabled?: boolean;
  /** Override the trigger button label (defaults to the action label). */
  triggerLabel?: string;
}

/**
 * Reason-capturing action dialog for suspend/ban/unban. Suspend & ban require a
 * reason (guardrail); the field uses FormField so the help affordance is
 * enforced. Confirming calls `onConfirm` and writes to the audit log upstream.
 */
export function UserActionDialog({ action, onConfirm, disabled = false, triggerLabel }: UserActionDialogProps) {
  const meta = ACTION_META[action];
  const [open, setOpen] = useState(false);
  const form = useForm<{ reason: string }>({
    resolver: zodResolver(meta.reasonRequired ? reasonFormSchema : optionalReasonSchema),
    mode: 'onBlur',
    defaultValues: { reason: '' },
  });

  useEffect(() => {
    if (open) form.reset({ reason: '' });
  }, [open, form]);

  const submit = form.handleSubmit(async (values) => {
    const reason = values.reason.trim();
    await onConfirm({ action, ...(reason ? { reason } : {}) });
    setOpen(false);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={meta.variant} disabled={disabled} data-action={action} data-entity="user">
          {triggerLabel ?? USER_ACTION_LABELS[action]}
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
            <FormField
              name="reason"
              label="Gerekçe"
              help={meta.help}
              helper={meta.reasonRequired ? 'En az 5 karakter.' : 'İsteğe bağlı.'}
              required={meta.reasonRequired}
            >
              <Textarea rows={3} placeholder="Gerekçeyi yazın…" data-action="edit-field" data-entity="user" />
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
                data-entity="user"
              >
                {USER_ACTION_LABELS[action]}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
