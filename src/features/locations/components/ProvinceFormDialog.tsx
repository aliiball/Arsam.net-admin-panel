import { useEffect, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { LOCATION_STATUSES, LOCATION_STATUS_LABELS } from '../data/locations';
import { provinceFormSchema, type Province, type ProvinceFormValues } from '../schemas/location';

export interface ProvinceFormDialogProps {
  /** When present the dialog edits this province; otherwise it creates one. */
  province?: Province;
  onSubmit: (values: ProvinceFormValues) => void | Promise<void>;
  /** Custom trigger; defaults to a button. */
  trigger?: ReactNode;
}

const EMPTY: ProvinceFormValues = { code: '', label: '', status: 'active' };

/** Create/edit a province's meta (plate code, label, status). */
export function ProvinceFormDialog({ province, onSubmit, trigger }: ProvinceFormDialogProps) {
  const [open, setOpen] = useState(false);
  const editing = Boolean(province);
  const form = useForm<ProvinceFormValues>({
    resolver: zodResolver(provinceFormSchema),
    mode: 'onBlur',
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (open) {
      form.reset(province ? { code: province.code, label: province.label, status: province.status } : EMPTY);
    }
  }, [open, province, form]);

  const submit = form.handleSubmit(async (values) => {
    await onSubmit(values);
    setOpen(false);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button data-action={editing ? 'edit' : 'create'} data-entity="province">
            {editing ? 'İli düzenle' : 'Yeni il'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'İli düzenle' : 'Yeni il'}</DialogTitle>
          <DialogDescription>İl meta bilgilerini düzenleyin. İlçe ve mahalleler detay sayfasından yönetilir.</DialogDescription>
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
              name="label"
              label="İl adı"
              help="Kullanıcıya gösterilen il adı (ör. İstanbul)."
              required
            >
              <Input placeholder="İstanbul" data-action="edit-field" data-entity="province" />
            </FormField>

            <FormField
              name="code"
              label="Plaka kodu"
              help="İlin iki haneli trafik plaka kodu (ör. 34). Benzersiz olmalıdır."
              helper="İki haneli sayı."
              required
            >
              <Input inputMode="numeric" maxLength={2} placeholder="34" data-action="edit-field" data-entity="province" />
            </FormField>

            <FormField name="status" label="Durum" help="Arşivlenen iller yeni ilanlarda ve filtrelerde gizlenir.">
              {(f) => (
                <Select value={(f.value as string) || 'active'} onValueChange={f.onChange}>
                  <SelectTrigger id={f.id} aria-invalid={f['aria-invalid']} aria-describedby={f['aria-describedby']}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATION_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {LOCATION_STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </FormField>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Vazgeç
              </Button>
              <Button
                type="submit"
                loading={form.formState.isSubmitting}
                data-action={editing ? 'confirm-edit' : 'confirm-create'}
                data-entity="province"
              >
                {editing ? 'Kaydet' : 'Oluştur'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
