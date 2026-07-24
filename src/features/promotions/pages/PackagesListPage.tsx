import { useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

import { DataTable } from '@/components/data-table/DataTable';
import { FilterBar } from '@/components/data-table/FilterBar';
import { useTableUrlState } from '@/components/data-table/use-table-url-state';
import type { FilterConfig } from '@/components/data-table/types';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { exportCsv, exportXls } from '@/lib/export';
import { Can } from '@/lib/permissions/permission-context';
import {
  PACKAGE_KINDS,
  PACKAGE_KIND_LABELS,
  PACKAGE_STATUSES,
  PACKAGE_STATUS_LABELS,
} from '../data/promotions';
import { packageColumns, type PackageTableMeta } from '../components/packageColumns';
import { PackageFormDialog } from '../components/PackageFormDialog';
import { usePackages, packageKeys } from '../api/queries';
import { useArchivePackage, useUpsertPackage } from '../api/mutations';
import { packageFormToPayload, sortByOrder, type DopingPackage } from '../schemas/promotion';

const filters: FilterConfig[] = [
  {
    id: 'status',
    label: 'Durum',
    kind: 'faceted',
    multiple: true,
    options: PACKAGE_STATUSES.map((s) => ({ value: s, label: PACKAGE_STATUS_LABELS[s] })),
  },
  {
    id: 'kind',
    label: 'Tür',
    kind: 'faceted',
    multiple: true,
    options: PACKAGE_KINDS.map((k) => ({ value: k, label: PACKAGE_KIND_LABELS[k] })),
  },
];

function parseNaturalLanguage(text: string): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  const lower = text.toLocaleLowerCase('tr');
  if (lower.includes('arşiv') || lower.includes('arsiv')) out.status = 'archived';
  if (lower.includes('aktif')) out.status = 'active';
  if (lower.includes('öne çık') || lower.includes('one cik')) out.kind = 'featured';
  if (lower.includes('vitrin')) out.kind = 'showcase';
  if (lower.includes('acil')) out.kind = 'urgent';
  if (lower.includes('üst sıra') || lower.includes('ust sira')) out.kind = 'top';
  return out;
}

export function PackagesListPage() {
  const state = useTableUrlState({ defaultPageSize: 25 });
  const { data, isLoading, isError, refetch } = usePackages(state.query);
  const upsert = useUpsertPackage();

  const items = data?.items ?? [];
  const ordered = sortByOrder(items);

  const meta: PackageTableMeta = {
    canEdit: true,
    onEdit: async (pkg, values) => {
      await upsert.mutateAsync({ id: pkg.id, values: packageFormToPayload(values) });
    },
  };

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Doping Paketleri</h1>
          <p className="text-muted-foreground text-sm">
            İlanları öne çıkaran doping paketleri; oluştur, düzenle ve arşivle. Değişiklikler denetim kaydına yazılır.
          </p>
        </div>
        <Can permission="promotion.sell">
          <PackageFormDialog
            onSubmit={async (values) => {
              await upsert.mutateAsync({ values: packageFormToPayload(values) });
            }}
          />
        </Can>
      </header>

      <DataTable
        columns={packageColumns}
        data={ordered}
        total={data?.total ?? 0}
        state={state}
        meta={meta}
        getRowId={(r) => r.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        emptyTitle="Paket bulunamadı"
        emptyDescription="Filtreleri değiştirin ya da yeni bir paket oluşturun."
        filterBar={
          <FilterBar
            tableKey="packages"
            filters={filters}
            state={state}
            searchPlaceholder="Paket adı ara…"
            onNaturalLanguage={parseNaturalLanguage}
          />
        }
        bulkActions={(ids, _all, clear) => (
          <BulkPackageActions packages={ordered.filter((p) => ids.includes(p.id))} clear={clear} />
        )}
        onExport={(format) => {
          try {
            const headers = ['Paket', 'Tür', 'Süre (gün)', 'Fiyat', 'Durum'];
            const rows = ordered.map((p: DopingPackage) => [
              p.name,
              PACKAGE_KIND_LABELS[p.kind],
              String(p.durationDays),
              String(p.price),
              PACKAGE_STATUS_LABELS[p.status],
            ]);
            const exporter = format === 'xls' ? exportXls : exportCsv;
            exporter('doping-paketleri', headers, rows);
            toast.success(`${rows.length} paket ${format.toUpperCase()} olarak dışa aktarıldı.`);
          } catch {
            toast.error('Dışa aktarma başarısız.');
          }
        }}
      />
    </div>
  );
}

/** Bulk-archive the selected packages (each write emits a package.archive audit entry). */
function BulkPackageActions({ packages, clear }: { packages: DopingPackage[]; clear: () => void }) {
  const qc = useQueryClient();
  const archive = useArchivePackage();
  const [open, setOpen] = useState(false);
  const archivable = packages.filter((p) => p.status !== 'archived');

  const run = async () => {
    try {
      await Promise.all(archivable.map((p) => archive.mutateAsync(p)));
      toast.success(`${archivable.length} paket arşivlendi.`);
      void qc.invalidateQueries({ queryKey: packageKeys.all });
      clear();
    } catch {
      toast.error('Toplu arşivleme başarısız.');
    }
  };

  return (
    <Can permission="promotion.sell">
      <Button
        variant="outline"
        size="sm"
        disabled={archivable.length === 0}
        onClick={() => setOpen(true)}
        data-action="bulk-archive"
        data-entity="package"
      >
        {archivable.length > 0 ? `${archivable.length} paketi arşivle` : 'Zaten arşivli'}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Paketleri arşivle"
        description={`Seçili ${archivable.length} paket arşivlenecek ve yeni satın almalarda gizlenecek. Bu işlem denetim kaydına yazılır.`}
        confirmLabel="Arşivle"
        onConfirm={run}
      />
    </Can>
  );
}
