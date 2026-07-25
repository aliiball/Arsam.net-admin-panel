import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Can } from '@/lib/permissions/permission-context';
import { getAuditFor } from '@/lib/audit';
import { AuditTimeline } from '@/features/audit';
import { useProvince } from '../api/queries';
import { useUpsertProvince } from '../api/mutations';
import { LocationStatusBadge } from '../components/LocationStatusBadge';
import { ProvinceFormDialog } from '../components/ProvinceFormDialog';
import { LocationTree } from '../components/LocationTree';

export function ProvinceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: province, isLoading, isError, refetch } = useProvince(id);
  const upsert = useUpsertProvince();

  if (isLoading) return <LoadingState label="İl yükleniyor…" />;
  if (isError || !province) return <ErrorState title="İl bulunamadı" onRetry={() => void refetch()} />;

  const audit = getAuditFor(`province:${province.id}`);
  const neighborhoodCount = province.districts.reduce((sum, d) => sum + d.neighborhoods.length, 0);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to="/locations" data-action="navigate" data-entity="province">
            <ArrowLeft className="size-4" /> Lokasyonlar
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-xl">{province.label}</CardTitle>
              <CardDescription>{province.code} plaka kodlu il.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <LocationStatusBadge status={province.status} />
              <Can permission="location.manage">
                <ProvinceFormDialog
                  province={province}
                  onSubmit={async (values) => {
                    await upsert.mutateAsync({ id: province.id, values });
                  }}
                  trigger={
                    <Button variant="outline" size="sm" data-action="edit" data-entity="province">
                      Düzenle
                    </Button>
                  }
                />
              </Can>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:grid-cols-4">
            <Field label="Plaka" value={province.code} />
            <Field label="Sıra" value={String(province.order + 1)} />
            <Field label="İlçe Sayısı" value={String(province.districts.length)} />
            <Field label="Mahalle Sayısı" value={String(neighborhoodCount)} />
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <LocationTree province={province} />
        </CardContent>
      </Card>

      {audit.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Denetim Kaydı</CardTitle>
            <CardDescription>Bu il üzerindeki her değişiklik kalıcı olarak kaydedilir.</CardDescription>
          </CardHeader>
          <CardContent>
            <AuditTimeline entries={audit} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
