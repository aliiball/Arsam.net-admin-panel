import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FieldHelp } from '@/components/form/FieldHelp';
import { cn } from '@/lib/utils';
import { ROLE_LABELS, type Permission, type PermissionMatrix, type Role } from '@/lib/permissions/permissions';
import { EmptyState } from '@/components/feedback/EmptyState';
import { isGranted, SUPER_ADMIN, type CatalogGroup } from '../schemas/rbac';

export interface PermissionMatrixEditorProps {
  roles: Role[];
  catalog: CatalogGroup[];
  matrix: PermissionMatrix;
  onToggle: (role: Role, permission: Permission, granted: boolean) => void;
  /** Skeleton grid while the matrix loads. */
  loading?: boolean;
  /** Disable every editable cell (e.g. an in-flight save). */
  disabled?: boolean;
}

/** 44px hit-area wrapper around the (small) checkbox — WCAG 2.2 target size. */
const CELL_HIT = 'inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center';

/**
 * Role × permission matrix editor. A real `<table>` (grouped by resource) with
 * column/row headers; each editable cell is a 44px-target checkbox whose
 * accessible name names the role + permission, so the grant state is conveyed by
 * shape + label, never color alone. The `super-admin` column is read-only `'*'`.
 */
export function PermissionMatrixEditor({
  roles,
  catalog,
  matrix,
  onToggle,
  loading,
  disabled,
}: PermissionMatrixEditorProps) {
  if (loading) {
    return (
      <div className="space-y-2" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-full" />
        ))}
      </div>
    );
  }

  if (catalog.length === 0) {
    return <EmptyState title="İzin yok" description="Gösterilecek izin tanımı bulunamadı." />;
  }

  return (
    <div className="space-y-2" data-entity="rbac">
      {/* Phones: the matrix scrolls horizontally with a sticky permission column;
          hint the gesture since roles can fall off-screen below md (640). */}
      <p className="text-muted-foreground text-xs xl:hidden" role="note">
        Rolleri görmek için tabloyu yana kaydırın; izin sütunu sabit kalır.
      </p>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse text-sm" role="grid">
        <caption className="sr-only">Rol ve izin matrisi — hücreleri değiştirerek izin verin veya kaldırın.</caption>
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th scope="col" className="sticky left-0 z-10 bg-muted/40 px-3 py-2 text-left font-medium">
              İzin
            </th>
            {roles.map((role) => (
              <th key={role} scope="col" className="px-3 py-2 text-center font-medium whitespace-nowrap">
                <span>{ROLE_LABELS[role]}</span>
                {role === SUPER_ADMIN && (
                  <span className="text-muted-foreground block text-xs font-normal">tüm izinler</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        {catalog.map((group) => (
          <tbody key={group.resource} className="border-b border-border last:border-0">
            <tr className="bg-muted/20">
              <th
                scope="colgroup"
                colSpan={roles.length + 1}
                className="px-3 py-1.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {group.label}
              </th>
            </tr>
            {group.actions.map((action) => (
              <tr key={action.permission} className="border-t border-border/60">
                <th scope="row" className="sticky left-0 z-10 bg-background px-3 py-2 text-left font-normal">
                  <span className="flex items-center gap-1.5">
                    <span>{action.label}</span>
                    <FieldHelp help={action.help} label={`${action.label} izni hakkında`} />
                    <code className="text-muted-foreground text-xs">{action.permission}</code>
                  </span>
                </th>
                {roles.map((role) => {
                  const granted = isGranted(matrix, role, action.permission);
                  const readOnly = role === SUPER_ADMIN;
                  return (
                    <td key={role} className="px-3 py-1 text-center">
                      {readOnly ? (
                        <Badge variant="secondary" aria-label={`${ROLE_LABELS[role]}: tüm izinler`}>
                          *
                        </Badge>
                      ) : (
                        <label className={cn(CELL_HIT, disabled && 'cursor-not-allowed opacity-50')}>
                          <Checkbox
                            checked={granted}
                            disabled={disabled}
                            onCheckedChange={(v) => onToggle(role, action.permission, v === true)}
                            aria-label={`${ROLE_LABELS[role]} için ${action.permission}`}
                            data-action="toggle-permission"
                            data-entity="rbac"
                          />
                        </label>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        ))}
        </table>
      </div>
    </div>
  );
}
