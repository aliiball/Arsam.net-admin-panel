import { useState } from 'react';
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Can } from '@/lib/permissions/permission-context';
import { sortByOrder, type District, type Neighborhood, type Province } from '../schemas/location';
import {
  useDeleteDistrict,
  useDeleteNeighborhood,
  useReorderDistricts,
  useReorderNeighborhoods,
  useUpsertDistrict,
  useUpsertNeighborhood,
} from '../api/mutations';
import { LocationStatusBadge } from './LocationStatusBadge';
import { DistrictFormDialog } from './DistrictFormDialog';
import { NeighborhoodFormDialog } from './NeighborhoodFormDialog';

/** Hierarchical il → ilçe → mahalle editor: add / edit / delete / reorder at every level. */
export function LocationTree({ province }: { province: Province }) {
  const districts = sortByOrder(province.districts);
  const upsertDistrict = useUpsertDistrict(province.id);
  const removeDistrict = useDeleteDistrict(province.id);
  const reorderDistricts = useReorderDistricts(province.id);
  const upsertNeighborhood = useUpsertNeighborhood(province.id);
  const removeNeighborhood = useDeleteNeighborhood(province.id);
  const reorderNeighborhoods = useReorderNeighborhoods(province.id);
  const [pendingDelete, setPendingDelete] = useState<District | null>(null);

  const moveDistrict = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= districts.length) return;
    const ids = districts.map((d) => d.id);
    [ids[index], ids[target]] = [ids[target]!, ids[index]!];
    reorderDistricts.mutate(ids);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">İlçeler &amp; Mahalleler</h3>
          <p className="text-muted-foreground text-xs">
            Bu ile bağlı ilçe ve mahalle hiyerarşisi. İlan formu ve filtreler bu taksonomiden beslenir.
          </p>
        </div>
        <Can permission="location.manage">
          <DistrictFormDialog
            existing={districts}
            onSubmit={async (values) => {
              await upsertDistrict.mutateAsync({ values });
            }}
          />
        </Can>
      </div>

      {districts.length === 0 ? (
        <EmptyState title="Henüz ilçe yok" description="Bu ile bağlı ilk ilçeyi ekleyin." />
      ) : (
        <ul className="divide-border divide-y rounded-md border" data-slot="district-list">
          {districts.map((district, i) => (
            <DistrictRow
              key={district.id}
              province={province}
              district={district}
              siblings={districts}
              isFirst={i === 0}
              isLast={i === districts.length - 1}
              reorderingDistricts={reorderDistricts.isPending}
              reorderingNeighborhoods={reorderNeighborhoods.isPending}
              onMove={(dir) => moveDistrict(i, dir)}
              onEdit={async (values) => {
                await upsertDistrict.mutateAsync({ districtId: district.id, values });
              }}
              onDelete={() => setPendingDelete(district)}
              onAddNeighborhood={async (values) => {
                await upsertNeighborhood.mutateAsync({ districtId: district.id, values });
              }}
              onEditNeighborhood={async (neighborhoodId, values) => {
                await upsertNeighborhood.mutateAsync({ districtId: district.id, neighborhoodId, values });
              }}
              onDeleteNeighborhood={async (neighborhoodId) => {
                await removeNeighborhood.mutateAsync({ districtId: district.id, neighborhoodId });
              }}
              onReorderNeighborhoods={(ids) => reorderNeighborhoods.mutate({ districtId: district.id, ids })}
            />
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        title="İlçeyi sil"
        description={
          pendingDelete
            ? `"${pendingDelete.label}" ilçesi ve tüm mahalleleri kaldırılacak. Bu işlem denetim kaydına yazılır.`
            : undefined
        }
        destructive
        confirmLabel="Sil"
        onConfirm={async () => {
          if (pendingDelete) await removeDistrict.mutateAsync(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}

interface DistrictRowProps {
  province: Province;
  district: District;
  siblings: District[];
  isFirst: boolean;
  isLast: boolean;
  reorderingDistricts: boolean;
  reorderingNeighborhoods: boolean;
  onMove: (dir: -1 | 1) => void;
  onEdit: (values: { key: string; label: string; status: District['status'] }) => Promise<void>;
  onDelete: () => void;
  onAddNeighborhood: (values: { name: string }) => Promise<void>;
  onEditNeighborhood: (neighborhoodId: string, values: { name: string }) => Promise<void>;
  onDeleteNeighborhood: (neighborhoodId: string) => Promise<void>;
  onReorderNeighborhoods: (ids: string[]) => void;
}

function DistrictRow({
  district,
  siblings,
  isFirst,
  isLast,
  reorderingDistricts,
  reorderingNeighborhoods,
  onMove,
  onEdit,
  onDelete,
  onAddNeighborhood,
  onEditNeighborhood,
  onDeleteNeighborhood,
  onReorderNeighborhoods,
}: DistrictRowProps) {
  const [expanded, setExpanded] = useState(false);
  const neighborhoods = sortByOrder(district.neighborhoods);

  return (
    <li className="p-3" data-slot="district-row">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex shrink-0 items-center">
          <Can permission="location.manage">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              disabled={isFirst || reorderingDistricts}
              onClick={() => onMove(-1)}
              aria-label={`${district.label} yukarı taşı`}
              data-action="move-up"
              data-entity="district"
            >
              <ArrowUp className="size-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              disabled={isLast || reorderingDistricts}
              onClick={() => onMove(1)}
              aria-label={`${district.label} aşağı taşı`}
              data-action="move-down"
              data-entity="district"
            >
              <ArrowDown className="size-4" />
            </Button>
          </Can>
        </div>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-label={`${district.label} mahallelerini ${expanded ? 'gizle' : 'göster'}`}
          data-action="toggle-expand"
          data-entity="district"
        >
          {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </Button>

        <div className="min-w-40 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{district.label}</span>
            <LocationStatusBadge status={district.status} />
          </div>
          <code className="text-muted-foreground text-xs">{district.key}</code>
        </div>

        <span className="text-muted-foreground text-xs tabular-nums">{neighborhoods.length} mahalle</span>

        <Can permission="location.manage">
          <div className="ml-auto flex items-center gap-1">
            <DistrictFormDialog
              district={district}
              existing={siblings}
              onSubmit={onEdit}
              trigger={
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label={`${district.label} düzenle`}
                  data-action="edit"
                  data-entity="district"
                >
                  <Pencil className="size-4" />
                </Button>
              }
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={onDelete}
              aria-label={`${district.label} sil`}
              data-action="delete"
              data-entity="district"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </Can>
      </div>

      {expanded && (
        <NeighborhoodEditor
          districtLabel={district.label}
          neighborhoods={neighborhoods}
          reordering={reorderingNeighborhoods}
          onAdd={onAddNeighborhood}
          onEdit={onEditNeighborhood}
          onDelete={onDeleteNeighborhood}
          onReorder={onReorderNeighborhoods}
        />
      )}
    </li>
  );
}

interface NeighborhoodEditorProps {
  districtLabel: string;
  neighborhoods: Neighborhood[];
  reordering: boolean;
  onAdd: (values: { name: string }) => Promise<void>;
  onEdit: (neighborhoodId: string, values: { name: string }) => Promise<void>;
  onDelete: (neighborhoodId: string) => Promise<void>;
  onReorder: (ids: string[]) => void;
}

function NeighborhoodEditor({
  districtLabel,
  neighborhoods,
  reordering,
  onAdd,
  onEdit,
  onDelete,
  onReorder,
}: NeighborhoodEditorProps) {
  const [pendingDelete, setPendingDelete] = useState<Neighborhood | null>(null);

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= neighborhoods.length) return;
    const ids = neighborhoods.map((n) => n.id);
    [ids[index], ids[target]] = [ids[target]!, ids[index]!];
    onReorder(ids);
  };

  return (
    <div className="mt-3 ml-6 space-y-2 border-l pl-4" data-slot="neighborhood-editor">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs font-medium">Mahalleler</span>
        <Can permission="location.manage">
          <NeighborhoodFormDialog onSubmit={onAdd} />
        </Can>
      </div>

      {neighborhoods.length === 0 ? (
        <p className="text-muted-foreground text-xs">Bu ilçeye henüz mahalle eklenmemiş.</p>
      ) : (
        <ul className="divide-border divide-y rounded-md border" data-slot="neighborhood-list">
          {neighborhoods.map((n, i) => (
            <li key={n.id} className="flex items-center gap-2 p-2">
              <Can permission="location.manage">
                <div className="flex shrink-0 items-center">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    disabled={i === 0 || reordering}
                    onClick={() => move(i, -1)}
                    aria-label={`${n.name} yukarı taşı`}
                    data-action="move-up"
                    data-entity="neighborhood"
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    disabled={i === neighborhoods.length - 1 || reordering}
                    onClick={() => move(i, 1)}
                    aria-label={`${n.name} aşağı taşı`}
                    data-action="move-down"
                    data-entity="neighborhood"
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                </div>
              </Can>

              <span className="flex-1 text-sm">{n.name}</span>

              <Can permission="location.manage">
                <div className="ml-auto flex items-center gap-1">
                  <NeighborhoodFormDialog
                    neighborhood={n}
                    onSubmit={(values) => onEdit(n.id, values)}
                    trigger={
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label={`${n.name} düzenle`}
                        data-action="edit"
                        data-entity="neighborhood"
                      >
                        <Pencil className="size-4" />
                      </Button>
                    }
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => setPendingDelete(n)}
                    aria-label={`${n.name} sil`}
                    data-action="delete"
                    data-entity="neighborhood"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </Can>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        title="Mahalleyi sil"
        description={
          pendingDelete
            ? `"${pendingDelete.name}" mahallesi ${districtLabel} ilçesinden kaldırılacak. Bu işlem denetim kaydına yazılır.`
            : undefined
        }
        destructive
        confirmLabel="Sil"
        onConfirm={async () => {
          if (pendingDelete) await onDelete(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
