import { useState } from 'react';
import { ArrowDown, ArrowUp, Asterisk, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Can } from '@/lib/permissions/permission-context';
import { sortByOrder, type AttributeField, type Category } from '../schemas/category';
import { useDeleteAttribute, useReorderAttributes, useUpsertAttribute } from '../api/mutations';
import { AttributeTypeBadge } from './AttributeTypeBadge';
import { AttributeFormDialog } from './AttributeFormDialog';

/** Manage a category's attribute set: add / edit / delete / reorder. */
export function AttributeEditor({ category }: { category: Category }) {
  const attributes = sortByOrder(category.attributes);
  const upsert = useUpsertAttribute(category.id);
  const remove = useDeleteAttribute(category.id);
  const reorder = useReorderAttributes(category.id);
  const [pendingDelete, setPendingDelete] = useState<AttributeField | null>(null);

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= attributes.length) return;
    const ids = attributes.map((a) => a.id);
    [ids[index], ids[target]] = [ids[target]!, ids[index]!];
    reorder.mutate(ids);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Nitelikler</h3>
          <p className="text-muted-foreground text-xs">İlan formunda bu kategoriye özel görünen alanlar.</p>
        </div>
        <Can permission="category.manage">
          <AttributeFormDialog
            existing={attributes}
            onSubmit={async (values) => {
              await upsert.mutateAsync({ values });
            }}
          />
        </Can>
      </div>

      {attributes.length === 0 ? (
        <EmptyState
          title="Henüz nitelik yok"
          description="Bu kategoriye ilan formunda görünecek alanlar ekleyin."
        />
      ) : (
        <ul className="divide-border divide-y rounded-md border" data-slot="attribute-list">
          {attributes.map((attr, i) => (
            <li key={attr.id} className="flex flex-wrap items-center gap-3 p-3">
              <div className="flex shrink-0 items-center">
                <Can permission="category.manage">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    disabled={i === 0 || reorder.isPending}
                    onClick={() => move(i, -1)}
                    aria-label={`${attr.label} yukarı taşı`}
                    data-action="move-up"
                    data-entity="attribute"
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    disabled={i === attributes.length - 1 || reorder.isPending}
                    onClick={() => move(i, 1)}
                    aria-label={`${attr.label} aşağı taşı`}
                    data-action="move-down"
                    data-entity="attribute"
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                </Can>
              </div>

              <div className="min-w-40 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium">{attr.label}</span>
                  {attr.required && (
                    <span className="text-destructive inline-flex items-center">
                      <Asterisk className="size-3" aria-label="Zorunlu alan" />
                    </span>
                  )}
                </div>
                <code className="text-muted-foreground text-xs">{attr.key}</code>
              </div>

              <div className="flex items-center gap-2">
                <AttributeTypeBadge type={attr.type} />
                {attr.unit && <span className="text-muted-foreground text-xs">{attr.unit}</span>}
                {attr.type === 'select' && attr.options && (
                  <span className="text-muted-foreground text-xs tabular-nums">{attr.options.length} seçenek</span>
                )}
              </div>

              <Can permission="category.manage">
                <div className="ml-auto flex items-center gap-1">
                  <AttributeFormDialog
                    attribute={attr}
                    existing={attributes}
                    onSubmit={async (values) => {
                      await upsert.mutateAsync({ attributeId: attr.id, values });
                    }}
                    trigger={
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label={`${attr.label} düzenle`}
                        data-action="edit"
                        data-entity="attribute"
                      >
                        <Pencil className="size-4" />
                      </Button>
                    }
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => setPendingDelete(attr)}
                    aria-label={`${attr.label} sil`}
                    data-action="delete"
                    data-entity="attribute"
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
        title="Niteliği sil"
        description={
          pendingDelete
            ? `"${pendingDelete.label}" alanı bu kategoriden kaldırılacak. Bu işlem denetim kaydına yazılır.`
            : undefined
        }
        destructive
        confirmLabel="Sil"
        onConfirm={async () => {
          if (pendingDelete) await remove.mutateAsync(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
