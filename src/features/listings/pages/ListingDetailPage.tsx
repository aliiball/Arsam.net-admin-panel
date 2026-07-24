import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { getAuditFor } from '@/lib/audit';
import {
  CATEGORY_LABELS,
  DEED_LABELS,
  HEATING_LABELS,
  LOCATIONS,
  ZONING_LABELS,
} from '../data/taxonomy';
import { useListing } from '../api/queries';
import { useModerateListing } from '../api/mutations';
import { ListingStatusBadge } from '../components/ListingStatusBadge';
import { AiSuggestionBadge } from '../components/AiSuggestionBadge';
import { ModerationDecision } from '../components/ModerationDecision';

export function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: listing, isLoading, isError, refetch } = useListing(id);
  const moderate = useModerateListing(id ?? '');

  if (isLoading) return <LoadingState label="İlan yükleniyor…" />;
  if (isError || !listing) return <ErrorState title="İlan bulunamadı" onRetry={() => void refetch()} />;

  const a = listing.attributes;
  const audit = getAuditFor(`listing:${listing.id}`);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to="/listings" data-action="navigate" data-entity="listing">
            <ArrowLeft className="size-4" /> İlanlar
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-xl">{listing.title}</CardTitle>
              <CardDescription>
                {CATEGORY_LABELS[listing.category]} · {LOCATIONS[listing.il]?.label} /{' '}
                {LOCATIONS[listing.il]?.districts[listing.ilce]?.label} / {listing.mahalle}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <ListingStatusBadge status={listing.status} />
              <AiSuggestionBadge suggestion={listing.aiSuggestion} reasons={listing.aiReasons} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-2xl font-semibold tabular-nums">{listing.price.toLocaleString('tr-TR')} ₺</p>
          <p className="text-muted-foreground text-sm">{listing.description}</p>

          <Separator />
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
            <Field label="Brüt m²" value={a.grossArea?.toString()} />
            <Field label="Net m²" value={a.netArea?.toString()} />
            <Field label="Oda Sayısı" value={a.rooms} />
            <Field label="Bina Yaşı" value={a.buildingAge?.toString()} />
            <Field label="Kat" value={a.floor?.toString()} />
            <Field label="Isıtma" value={a.heating ? HEATING_LABELS[a.heating as keyof typeof HEATING_LABELS] : undefined} />
            <Field label="Tapu Durumu" value={a.deedStatus ? DEED_LABELS[a.deedStatus as keyof typeof DEED_LABELS] : undefined} />
            {listing.category === 'arsa' && (
              <Field label="İmar Durumu" value={a.zoning ? ZONING_LABELS[a.zoning as keyof typeof ZONING_LABELS] : undefined} />
            )}
            <Field label="Emlak Ofisi" value={listing.agentName} />
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Moderasyon</CardTitle>
          <CardDescription>AI önerir, siz karar verirsiniz. Her karar denetim kaydına yazılır.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ModerationDecision
            onDecide={async (input) => {
              await moderate.mutateAsync(input);
            }}
            loading={moderate.isPending}
          />
          {audit.length > 0 && (
            <>
              <Separator />
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | undefined }) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="tabular-nums">{value ?? '—'}</dd>
    </div>
  );
}
