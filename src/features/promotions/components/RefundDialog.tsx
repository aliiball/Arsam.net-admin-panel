import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Undo2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
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
import { formatTry, makeRefundFormSchema, type RefundActionInput, type RefundFormValues } from '../schemas/promotion';

export interface RefundDialogProps {
  /** The remaining refundable balance (₺); the amount can never exceed it. */
  remaining: number;
  onConfirm: (input: RefundActionInput) => void | Promise<void>;
  disabled?: boolean;
  trigger?: React.ReactNode;
}

/**
 * Purpose-built refund dialog (not the three-tier moderation decision). Captures
 * a full-or-partial amount + a required reason; both fields use FormField so the
 * help affordance is enforced. The amount can never exceed `remaining`.
 */
export function RefundDialog({ remaining, onConfirm, disabled = false, trigger }: RefundDialogProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<RefundFormValues>({
    resolver: zodResolver(makeRefundFormSchema(remaining)),
    mode: 'onBlur',
    defaultValues: { full: true, amount: String(remaining), reason: '' },
  });

  const full = useWatch({ control: form.control, name: 'full' });

  useEffect(() => {
    if (open) form.reset({ full: true, amount: String(remaining), reason: '' });
  }, [open, remaining, form]);

  // A full refund always bills the remaining balance; keep the amount in sync.
  useEffect(() => {
    if (full) form.setValue('amount', String(remaining), { shouldValidate: true });
  }, [full, remaining, form]);

  const submit = form.handleSubmit(async (values) => {
    await onConfirm({ amount: Number(values.amount), reason: values.reason.trim() });
    setOpen(false);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="destructive" disabled={disabled} data-action="refund" data-entity="payment">
            <Undo2 className="size-4" /> İade et
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ödemeyi iade et</DialogTitle>
          <DialogDescription>
            Kalan iade edilebilir tutar: <span className="tabular-nums font-medium">{formatTry(remaining)}</span>. Gerekçe
            denetim kaydına yazılır.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            <FormField
              name="full"
              label="Tam iade"
              help="Açık olduğunda kalan tutarın tamamı iade edilir; kapatınca kısmi tutar girebilirsiniz."
            >
              {(f) => (
                <div className="flex items-center">
                  <Switch
                    id={f.id}
                    checked={Boolean(f.value)}
                    onCheckedChange={f.onChange}
                    aria-describedby={f['aria-describedby']}
                    data-action="toggle-full-refund"
                    data-entity="payment"
                  />
                </div>
              )}
            </FormField>

            <FormField
              name="amount"
              label="İade tutarı (₺)"
              help="İade edilecek tutar. Kalan tutarı aşamaz; sadece rakam."
              helper={`En fazla ${formatTry(remaining)}.`}
              required
            >
              <Input
                inputMode="numeric"
                disabled={Boolean(full)}
                placeholder={String(remaining)}
                data-action="edit-field"
                data-entity="payment"
              />
            </FormField>

            <FormField
              name="reason"
              label="Gerekçe"
              help="İadenin nedenini açıkça belirtin; karar denetim kaydına kalıcı olarak yazılır."
              helper="En az 5 karakter."
              required
            >
              <Textarea rows={3} placeholder="İade gerekçesini yazın…" data-action="edit-field" data-entity="payment" />
            </FormField>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Vazgeç
              </Button>
              <Button
                type="submit"
                variant="destructive"
                loading={form.formState.isSubmitting}
                data-action="confirm-refund"
                data-entity="payment"
              >
                İadeyi onayla
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
