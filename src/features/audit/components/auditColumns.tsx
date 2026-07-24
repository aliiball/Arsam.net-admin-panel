import type { ColumnDef } from '@tanstack/react-table';

import type { AuditEntry } from '@/lib/audit';
import { AuditActorBadge } from './AuditActorBadge';
import { auditReason } from '../lib/audit-utils';

export const auditColumns: ColumnDef<AuditEntry>[] = [
  {
    accessorKey: 'ts',
    header: 'Zaman',
    cell: ({ getValue }) => (
      <span className="text-muted-foreground font-mono text-xs tabular-nums">
        {getValue<string>().slice(0, 16).replace('T', ' ')}
      </span>
    ),
  },
  {
    accessorKey: 'actor',
    header: 'Aktör',
    cell: ({ getValue }) => <AuditActorBadge actor={getValue<string>()} />,
  },
  {
    accessorKey: 'action',
    header: 'İşlem',
    cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
  },
  {
    accessorKey: 'resource',
    header: 'Kaynak',
    cell: ({ getValue }) => <span className="font-mono text-xs">{getValue<string>()}</span>,
  },
  {
    id: 'reason',
    header: 'Gerekçe',
    enableSorting: false,
    accessorFn: (row) => auditReason(row) ?? '',
    cell: ({ getValue }) => {
      const reason = getValue<string>();
      return reason ? <span className="text-sm">{reason}</span> : <span className="text-muted-foreground">—</span>;
    },
  },
];
