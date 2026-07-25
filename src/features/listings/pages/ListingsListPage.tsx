import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table/DataTable';
import { MobileListCard } from '@/components/data-table/MobileListCard';
import { FilterBar } from '@/components/data-table/FilterBar';
import { useTableUrlState } from '@/components/data-table/use-table-url-state';
import type { FilterConfig } from '@/components/data-table/types';
import { exportCsv, exportXls } from '@/lib/export';
import { api, encodeListQuery } from '@/lib/api/client';
import type { Paginated } from '@/lib/api/types';
import { Can } from '@/lib/permissions/permission-context';
import { parseFilters } from '@/lib/ai';
import type { Listing } from '../schemas/listing';
import {
  CATEGORIES,
  CATEGORY_LABELS,
  LOCATIONS,
  STATUSES,
  STATUS_LABELS,
  ilOptions,
} from '../data/taxonomy';
import { listingFilterContext } from '../lib/nl-context';
import { listingColumns } from '../components/listingColumns';
import { ListingStatusBadge } from '../components/ListingStatusBadge';
import { AiSuggestionBadge } from '../components/AiSuggestionBadge';
import { useListings } from '../api/queries';

const filters: FilterConfig[] = [
  {
    id: 'status',
    label: 'Durum',
    kind: 'faceted',
    multiple: true,
    options: STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] })),
  },
  {
    id: 'category',
    label: 'Kategori',
    kind: 'faceted',
    multiple: true,
    options: CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] })),
  },
  {
    id: 'il',
    label: 'Şehir',
    kind: 'faceted',
    multiple: false,
    options: ilOptions(),
  },
  { id: 'price', label: 'Fiyat', kind: 'numberRange', unit: '₺' },
];

/**
 * Parse Turkish free text into proposed listing filters via the shared,
 * deterministic `lib/ai` parser (single origin — the global assistant parses
 * through the same core). Behaviour is a superset of the old inline parser:
 * category / city / status plus price + m² ranges.
 */
function parseNaturalLanguage(text: string): Record<string, string | string[]> {
  return parseFilters(text, listingFilterContext()).filters;
}

export function ListingsListPage() {
  const state = useTableUrlState({ defaultPageSize: 25 });
  const { data, isLoading, isError, refetch } = useListings(state.query);

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">İlanlar</h1>
          <p className="text-muted-foreground text-sm">Konut, işyeri, arsa, devremülk ve turistik ilanları.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link to="/listings/moderation" data-action="navigate" data-entity="listing">
              Moderasyon Kuyruğu
            </Link>
          </Button>
          <Can permission="listing.edit">
            <Button asChild>
              <Link to="/listings/create" data-action="create" data-entity="listing">
                <Plus className="size-4" /> Yeni ilan
              </Link>
            </Button>
          </Can>
        </div>
      </header>

      <DataTable
        columns={listingColumns}
        data={data?.items ?? []}
        total={data?.total ?? 0}
        state={state}
        getRowId={(r) => r.id}
        columnControls
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        filterBar={
          <FilterBar
            tableKey="listings"
            filters={filters}
            state={state}
            searchPlaceholder="İlan başlığı ara…"
            onNaturalLanguage={parseNaturalLanguage}
          />
        }
        renderSubRow={(row) => (
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm md:grid-cols-4">
            <Detail label="İlan No" value={row.id} />
            <Detail label="Ofis" value={row.agentName} />
            <Detail label="Brüt m²" value={row.attributes.grossArea?.toString() ?? '—'} />
            <Detail label="Oda" value={row.attributes.rooms ?? '—'} />
          </div>
        )}
        renderMobileCard={(row, selected, toggle) => (
          <MobileListCard
            title={row.title}
            to={`/listings/${row.id}`}
            entity="listing"
            selected={selected}
            onToggleSelect={toggle}
            selectLabel={`${row.title} satırını seç`}
            badges={
              <>
                <ListingStatusBadge status={row.status} />
                <AiSuggestionBadge suggestion={row.aiSuggestion} reasons={row.aiReasons} />
              </>
            }
            meta={[
              { label: 'Kategori', value: CATEGORY_LABELS[row.category] },
              { label: 'Şehir', value: LOCATIONS[row.il]?.label ?? row.il },
              { label: 'Fiyat', value: `${row.price.toLocaleString('tr-TR')} ₺`, full: true },
            ]}
          />
        )}
        bulkActions={(ids, _all, clear) => (
          <Can permission="listing.approve">
            <Button size="sm" variant="outline" onClick={clear}>
              {ids.length} ilanı incele
            </Button>
          </Can>
        )}
        onExport={async (format, scope, ctx) => {
          try {
            let listings: Listing[];
            if (scope === 'selection') {
              const ids = new Set(ctx.selectedIds);
              listings = ctx.pageRows.filter((r) => ids.has(r.id));
            } else if (scope === 'all') {
              const params = encodeListQuery({
                page: 1,
                pageSize: Math.max(data?.total ?? 1000, 1),
                sort: state.query.sort,
                filters: state.query.filters,
              });
              if (state.query.q) params.set('q', state.query.q);
              const res = await api.get<Paginated<Listing>>('/listings', params);
              listings = res.items;
            } else {
              listings = ctx.pageRows;
            }
            const headers = ['İlan No', 'Başlık', 'Kategori', 'Durum', 'Fiyat'];
            const rows = listings.map((r) => [
              r.id,
              r.title,
              CATEGORY_LABELS[r.category],
              STATUS_LABELS[r.status],
              String(r.price),
            ]);
            const exporter = format === 'xls' ? exportXls : exportCsv;
            exporter('ilanlar', headers, rows);
            toast.success(`${rows.length} kayıt ${format.toUpperCase()} olarak dışa aktarıldı.`);
          } catch {
            toast.error('Dışa aktarma başarısız.');
          }
        }}
      />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
