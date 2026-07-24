import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Can } from '@/lib/permissions/permission-context';
import { getAuditFor } from '@/lib/audit';
import { useCategory } from '../api/queries';
import { useUpsertCategory } from '../api/mutations';
import { CategoryStatusBadge } from '../components/CategoryStatusBadge';
import { CategoryFormDialog } from '../components/CategoryFormDialog';
import { AttributeEditor } from '../components/AttributeEditor';

export function CategoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: category, isLoading, isError, refetch } = useCategory(id);
  const upsert = useUpsertCategory();

  if (isLoading) return <LoadingState label="Kategori yükleniyor…" />;
  if (isError || !category) return <ErrorState title="Kategori bulunamadı" onRetry={() => void refetch()} />;

  const audit = getAuditFor(`category:${category.id}`);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to="/categories" data-action="navigate" data-entity="category">
            <ArrowLeft className="size-4" /> Kategoriler
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-xl">{category.label}</CardTitle>
              <CardDescription>{category.description || 'Açıklama girilmemiş.'}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <CategoryStatusBadge status={category.status} />
              <Can permission="category.manage">
                <CategoryFormDialog
                  category={category}
                  onSubmit={async (values) => {
                    await upsert.mutateAsync({ id: category.id, values });
                  }}
                  trigger={
                    <Button variant="outline" size="sm" data-action="edit" data-entity="category">
                      Düzenle
                    </Button>
                  }
                />
              </Can>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
            <Field label="Anahtar" value={category.key} mono />
            <Field label="Simge" value={category.icon ?? '—'} />
            <Field label="Sıra" value={String(category.order + 1)} />
            <Field label="Nitelik Sayısı" value={String(category.attributes.length)} />
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <AttributeEditor category={category} />
        </CardContent>
      </Card>

      {audit.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Denetim Kaydı</CardTitle>
            <CardDescription>Bu kategori üzerindeki her değişiklik kalıcı olarak kaydedilir.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm">
              {audit.map((entry) => (
                <li key={entry.id} className="flex items-start gap-2">
                  <span className="text-muted-foreground font-mono text-xs">{entry.ts.slice(0, 10)}</span>
                  <span>
                    <span className="font-medium">{entry.action}</span> — {entry.actor}
                  </span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className={mono ? 'font-mono text-xs' : 'tabular-nums'}>{value}</dd>
    </div>
  );
}
