import { toast } from 'sonner';

import { DataTable } from '@/components/data-table/DataTable';
import { FilterBar } from '@/components/data-table/FilterBar';
import { useTableUrlState } from '@/components/data-table/use-table-url-state';
import type { FilterConfig } from '@/components/data-table/types';
import { exportCsv, exportXls } from '@/lib/export';
import { api, encodeListQuery } from '@/lib/api/client';
import type { AuditEntry } from '@/lib/audit';
import type { Paginated } from '@/lib/api/types';
import {
  ACTION_FAMILIES,
  ACTION_FAMILY_LABELS,
  ACTOR_KINDS,
  ACTOR_KIND_LABELS,
} from '../data/audit';
import { auditColumns } from '../components/auditColumns';
import { AuditTimeline } from '../components/AuditTimeline';
import { useAuditLog } from '../api/queries';
import { auditReason } from '../lib/audit-utils';

const filters: FilterConfig[] = [
  {
    id: 'family',
    label: 'İşlem türü',
    kind: 'faceted',
    multiple: true,
    options: ACTION_FAMILIES.map((f) => ({ value: f, label: ACTION_FAMILY_LABELS[f] })),
  },
  {
    id: 'actorKind',
    label: 'Aktör',
    kind: 'faceted',
    multiple: true,
    options: ACTOR_KINDS.map((k) => ({ value: k, label: ACTOR_KIND_LABELS[k] })),
  },
  { id: 'ts', label: 'Tarih', kind: 'dateRange' },
];

function parseNaturalLanguage(text: string): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  const lower = text.toLocaleLowerCase('tr');
  const familyHints: Record<string, string> = {
    ilan: 'listing',
    kullanıcı: 'user',
    kullanici: 'user',
    kategori: 'category',
    lokasyon: 'location',
    şikayet: 'report',
    sikayet: 'report',
    paket: 'package',
    ödeme: 'payment',
    odeme: 'payment',
  };
  const families = Object.entries(familyHints)
    .filter(([word]) => lower.includes(word))
    .map(([, value]) => value);
  if (families.length) out.family = families;
  if (lower.includes('yapay zeka') || lower.includes('otomatik') || lower.includes(' ai')) out.actorKind = 'ai';
  else if (lower.includes('insan') || lower.includes('manuel')) out.actorKind = 'human';
  return out;
}

export function AuditListPage() {
  const state = useTableUrlState({ defaultPageSize: 25 });
  const { data, isLoading, isError, refetch } = useAuditLog(state.query);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">Denetim Kaydı</h1>
        <p className="text-muted-foreground text-sm">
          Tüm modüllerdeki yönetici ve yapay zeka işlemlerinin değiştirilemez kaydı. Salt okunur.
        </p>
      </header>

      <DataTable
        columns={auditColumns}
        data={data?.items ?? []}
        total={data?.total ?? 0}
        state={state}
        getRowId={(r) => r.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        emptyTitle="Denetim kaydı bulunamadı"
        emptyDescription="Filtreleri değiştirin ya da tarih aralığını genişletin. Kayıtlar işlemler yapıldıkça oluşur."
        filterBar={
          <FilterBar
            tableKey="audit"
            filters={filters}
            state={state}
            searchPlaceholder="Kaynak, işlem, aktör veya gerekçe ara…"
            onNaturalLanguage={parseNaturalLanguage}
          />
        }
        renderSubRow={(row) => (
          <div className="max-w-3xl">
            <AuditTimeline entries={[row]} />
          </div>
        )}
        onExport={async (format, scope) => {
          try {
            let entries: AuditEntry[];
            if (scope === 'all') {
              const params = encodeListQuery({
                page: 1,
                pageSize: Math.max(data?.total ?? 1000, 1),
                sort: state.query.sort,
                filters: state.query.filters,
              });
              if (state.query.q) params.set('q', state.query.q);
              const res = await api.get<Paginated<AuditEntry>>('/audit', params);
              entries = res.items;
            } else {
              entries = data?.items ?? [];
            }
            const headers = ['Zaman', 'Aktör', 'İşlem', 'Kaynak', 'Gerekçe'];
            const rows = entries.map((e) => [
              e.ts,
              e.actor,
              e.action,
              e.resource,
              auditReason(e) ?? '',
            ]);
            const exporter = format === 'xls' ? exportXls : exportCsv;
            exporter('denetim-kaydi', headers, rows);
            toast.success(`${rows.length} kayıt ${format.toUpperCase()} olarak dışa aktarıldı.`);
          } catch {
            toast.error('Dışa aktarma başarısız.');
          }
        }}
      />
    </div>
  );
}
