import { useEffect, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  neighborhoodFormSchema,
  type Neighborhood,
  type NeighborhoodFormValues,
} from '../schemas/location';

export interface NeighborhoodFormDialogProps {
  /** When present the dialog edits this neighborhood; otherwise it creates one. */
  neighborhood?: Neighborhood;
  onSubmit: (values: NeighborhoodFormValues) => void | Promise<void>;
  trigger?: ReactNode;
}

const EMPTY: NeighborhoodFormValues = { name: '' };

/** Add/edit a neighborhood (just its name). */
export function NeighborhoodFormDialog({ neighborhood, onSubmit, trigger }: NeighborhoodFormDialogProps) {
  const [open, setOpen] = useState(false);
  const editing = Boolean(neighborhood);
  const form = useForm<NeighborhoodFormValues>({
    resolver: zodResolver(neighborhoodFormSchema),
    mode: 'onBlur',
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (open) form.reset(neighborhood ? { name: neighborhood.name } : EMPTY);
  }, [open, neighborhood, form]);

  const submit = form.handleSubmit(async (values) => {
    await onSubmit(values);
    setOpen(false);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="outline" data-action={editing ? 'edit' : 'create'} data-entity="neighborhood">
            {editing ? 'Düzenle' : 'Mahalle ekle'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Mahalleyi düzenle' : 'Yeni mahalle'}</DialogTitle>
          <DialogDescription>Bu ilçeye bağlı mahalle.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            <FormField name="name" label="Mahalle adı" help="Kullanıcıya gösterilen mahalle adı (ör. Moda)." required>
              <Input placeholder="Moda" data-action="edit-field" data-entity="neighborhood" />
            </FormField>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Vazgeç
              </Button>
              <Button
                type="submit"
                loading={form.formState.isSubmitting}
                data-action={editing ? 'confirm-edit' : 'confirm-create'}
                data-entity="neighborhood"
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
