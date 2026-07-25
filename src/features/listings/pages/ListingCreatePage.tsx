import { useNavigate } from 'react-router-dom';
import { useForm, useFormContext, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { FormField } from '@/components/form/FormField';
import { CascadingSelect, type CascadeLevel } from '@/components/form/CascadingSelect';
import { Wizard, type WizardStep } from '@/components/form/Wizard';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CATEGORIES,
  CATEGORY_ATTRIBUTES,
  CATEGORY_LABELS,
  DEED_LABELS,
  DEED_STATUS,
  HEATING,
  HEATING_LABELS,
  ZONING,
  ZONING_LABELS,
  ilOptions,
  ilceOptions,
  mahalleOptions,
  type Category,
} from '../data/taxonomy';
import { listingFormSchema, type ListingFormValues } from '../schemas/listing';
import { useCreateListing } from '../api/mutations';

const ATTRIBUTE_META: Record<string, { label: string; help: string; kind: 'number' | 'text' | 'select'; options?: { value: string; label: string }[]; unit?: string }> = {
  grossArea: { label: 'Brüt m²', help: 'Duvarlar dahil toplam alan.', kind: 'number', unit: 'm²' },
  netArea: { label: 'Net m²', help: 'Kullanılabilir (net) alan.', kind: 'number', unit: 'm²' },
  rooms: { label: 'Oda Sayısı', help: 'Örn. 2+1, 3+1.', kind: 'text' },
  buildingAge: { label: 'Bina Yaşı', help: 'Binanın yaşı (yıl).', kind: 'number' },
  floor: { label: 'Bulunduğu Kat', help: 'Dairenin bulunduğu kat.', kind: 'number' },
  heating: { label: 'Isıtma', help: 'Isıtma tipi.', kind: 'select', options: HEATING.map((h) => ({ value: h, label: HEATING_LABELS[h] })) },
  deedStatus: { label: 'Tapu Durumu', help: 'Tapu türü.', kind: 'select', options: DEED_STATUS.map((d) => ({ value: d, label: DEED_LABELS[d] })) },
  zoning: { label: 'İmar Durumu', help: 'Arsanın imar durumu.', kind: 'select', options: ZONING.map((z) => ({ value: z, label: ZONING_LABELS[z] })) },
};

function AttributeField({ name }: { name: string }) {
  const meta = ATTRIBUTE_META[name]!;
  return (
    <FormField name={name} label={meta.label} help={meta.help} required>
      {meta.kind === 'select'
        ? (f) => (
            <Select value={(f.value as string) || ''} onValueChange={f.onChange}>
              <SelectTrigger id={f.id} aria-invalid={f['aria-invalid']} aria-describedby={f['aria-describedby']}>
                <SelectValue placeholder="Seçin" />
              </SelectTrigger>
              <SelectContent>
                {meta.options?.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        : (
            <Input inputMode={meta.kind === 'number' ? 'numeric' : 'text'} placeholder={meta.label} data-entity="listing" data-action="edit-field" />
          )}
    </FormField>
  );
}

function AttributesStep() {
  const category = useWatch<ListingFormValues>({ name: 'category' }) as Category;
  const attrs = CATEGORY_ATTRIBUTES[category] ?? [];
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {attrs.map((name) => (
        <AttributeField key={name} name={name} />
      ))}
    </div>
  );
}

const levels: CascadeLevel[] = [
  { key: 'il', label: 'İl', getOptions: () => ilOptions() },
  { key: 'ilce', label: 'İlçe', getOptions: (s) => ilceOptions(s.il ?? '') },
  { key: 'mahalle', label: 'Mahalle', getOptions: (s) => mahalleOptions(s.il ?? '', s.ilce ?? '') },
];

function LocationStep() {
  const { control, setValue, formState } = useFormContext<ListingFormValues>();
  const value = useWatch({ control, name: ['il', 'ilce', 'mahalle'] });
  const [il, ilce, mahalle] = value;
  const err = formState.errors;

  return (
    <CascadingSelect
      label="Konum"
      help="İl, ilçe ve mahalleyi sırayla seçin. Üst seçim değişince alt seçim sıfırlanır."
      levels={levels}
      value={{ il: il ?? '', ilce: ilce ?? '', mahalle: mahalle ?? '' }}
      errors={{ il: err.il?.message, ilce: err.ilce?.message, mahalle: err.mahalle?.message }}
      onChange={(next) => {
        setValue('il', next.il ?? '', { shouldValidate: true, shouldDirty: true });
        setValue('ilce', next.ilce ?? '', { shouldValidate: true, shouldDirty: true });
        setValue('mahalle', next.mahalle ?? '', { shouldValidate: true, shouldDirty: true });
      }}
    />
  );
}

function ReviewStep() {
  const values = useWatch<ListingFormValues>();
  return (
    <dl className="grid grid-cols-2 gap-y-2 text-sm">
      <dt className="text-muted-foreground">Başlık</dt>
      <dd>{values.title || '—'}</dd>
      <dt className="text-muted-foreground">Kategori</dt>
      <dd>{values.category ? CATEGORY_LABELS[values.category as Category] : '—'}</dd>
      <dt className="text-muted-foreground">Fiyat</dt>
      <dd className="tabular-nums">{values.price ? `${Number(values.price).toLocaleString('tr-TR')} ₺` : '—'}</dd>
      <dt className="text-muted-foreground">Konum</dt>
      <dd>
        {[values.il, values.ilce, values.mahalle].filter(Boolean).join(' / ') || '—'}
      </dd>
    </dl>
  );
}

export function ListingCreatePage() {
  const navigate = useNavigate();
  const create = useCreateListing();
  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingFormSchema),
    mode: 'onBlur',
    defaultValues: {
      title: '',
      description: '',
      category: 'konut',
      price: '',
      il: '',
      ilce: '',
      mahalle: '',
      grossArea: '',
      netArea: '',
      rooms: '',
      buildingAge: '',
      floor: '',
      heating: '',
      deedStatus: '',
      zoning: '',
    },
  });

  const category = form.watch('category') as Category;
  const attrFields = CATEGORY_ATTRIBUTES[category] ?? [];

  const steps: WizardStep<ListingFormValues>[] = [
    {
      id: 'basic',
      title: 'Temel Bilgiler',
      description: 'İlan başlığı, açıklaması, kategorisi ve fiyatı.',
      fields: ['title', 'description', 'category', 'price'],
      content: (
        <div className="grid gap-4">
          <FormField name="title" label="Başlık" help="Kısa, açıklayıcı bir başlık girin." required>
            <Input placeholder="Örn. Deniz manzaralı 3+1 daire" data-entity="listing" data-action="edit-field" />
          </FormField>
          <FormField name="description" label="Açıklama" helper="İlanın detaylı açıklaması." required>
            <Textarea rows={4} placeholder="Açıklama…" />
          </FormField>
          <FormField name="category" label="Kategori" help="İlan kategorisi, sonraki adımdaki alanları belirler." required>
            {(f) => (
              <Select value={(f.value as string) || ''} onValueChange={f.onChange}>
                <SelectTrigger id={f.id} aria-invalid={f['aria-invalid']} aria-describedby={f['aria-describedby']}>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {CATEGORY_LABELS[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FormField>
          <FormField name="price" label="Fiyat (₺)" help="Sadece rakam girin." required>
            <Input inputMode="numeric" placeholder="0" data-entity="listing" data-action="edit-field" />
          </FormField>
        </div>
      ),
    },
    {
      id: 'attributes',
      title: 'Nitelikler',
      description: `${CATEGORY_LABELS[category]} için gerekli alanlar.`,
      fields: attrFields as (keyof ListingFormValues)[],
      content: <AttributesStep />,
    },
    {
      id: 'location',
      title: 'Konum',
      description: 'İl → ilçe → mahalle.',
      fields: ['il', 'ilce', 'mahalle'],
      content: <LocationStep />,
    },
    {
      id: 'review',
      title: 'Özet',
      description: 'Bilgileri gözden geçirip ilanı oluşturun.',
      content: <ReviewStep />,
    },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">Yeni İlan</h1>
      <Wizard
        form={form}
        steps={steps}
        draftKey="arsam.draft.listing-create"
        submitLabel="İlanı Oluştur"
        onCancel={() => navigate('/listings')}
        onComplete={async (values) => {
          await create.mutateAsync(values);
          navigate('/listings');
        }}
      />
    </div>
  );
}
