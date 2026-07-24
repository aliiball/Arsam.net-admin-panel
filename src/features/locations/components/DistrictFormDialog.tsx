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
import {
  districtFormSchema,
  validateKeyUnique,
  type District,
  type DistrictFormValues,
} from '../schemas/location';

export interface DistrictFormDialogProps {
  /** When present the dialog edits this district; otherwise it creates one. */
  district?: District;
  /** Sibling districts, for key-uniqueness validation. */
  existing: District[];
  onSubmit: (values: DistrictFormValues) => void | Promise<void>;
  trigger?: ReactNode;
}

const EMPTY: DistrictFormValues = { key: '', label: '', status: 'active' };

/** Add/edit a district's meta (slug key, label, status). */
export function DistrictFormDialog({ district, existing, onSubmit, trigger }: DistrictFormDialogProps) {
  const [open, setOpen] = useState(false);
  const editing = Boolean(district);
  const form = useForm<DistrictFormValues>({
    resolver: zodResolver(districtFormSchema),
    mode: 'onBlur',
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (open) {
      form.reset(district ? { key: district.key, label: district.label, status: district.status } : EMPTY);
    }
  }, [open, district, form]);

  const submit = form.handleSubmit(async (values) => {
    if (!validateKeyUnique(values.key, existing, district?.id)) {
      form.setError('key', { message: 'Bu ilçe anahtarı bu ilde zaten var.' });
      return;
    }
    await onSubmit(values);
    setOpen(false);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" data-action={editing ? 'edit' : 'create'} data-entity="district">
            {editing ? 'Düzenle' : 'İlçe ekle'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'İlçeyi düzenle' : 'Yeni ilçe'}</DialogTitle>
          <DialogDescription>Bu ile bağlı ilçe. Mahalleler ilçe altından yönetilir.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            <FormField name="label" label="İlçe adı" help="Kullanıcıya gösterilen ilçe adı (ör. Kadıköy)." required>
              <Input placeholder="Kadıköy" data-action="edit-field" data-entity="district" />
            </FormField>

            <FormField
              name="key"
              label="Anahtar"
              help="Kod tarafında kullanılan sabit anahtar. Küçük harf, rakam ve tire; örneğin kadikoy."
              helper="Oluşturduktan sonra değiştirmemeniz önerilir."
              required
            >
              <Input placeholder="kadikoy" data-action="edit-field" data-entity="district" />
            </FormField>

            <FormField name="status" label="Durum" help="Arşivlenen ilçeler yeni ilanlarda ve filtrelerde gizlenir.">
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
                data-entity="district"
              >
                {editing ? 'Kaydet' : 'Ekle'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
