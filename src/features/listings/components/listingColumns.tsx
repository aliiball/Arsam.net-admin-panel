import type { ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router-dom';

import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { CATEGORY_LABELS, LOCATIONS } from '../data/taxonomy';
import type { Listing } from '../schemas/listing';
import { ListingStatusBadge } from './ListingStatusBadge';
import { AiSuggestionBadge } from './AiSuggestionBadge';

export const listingColumns: ColumnDef<Listing>[] = [
  {
    id: 'select',
    enableSorting: false,
    enableHiding: false,
    size: 44,
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllRowsSelected() ? true : table.getIsSomeRowsSelected() ? 'indeterminate' : false}
        onCheckedChange={(v) => table.toggleAllRowsSelected(!!v)}
        aria-label="Tümünü seç"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        aria-label={`${row.original.title} satırını seç`}
      />
    ),
  },
  {
    accessorKey: 'title',
    header: 'Başlık',
    cell: ({ row }) => (
      <Link to={`/listings/${row.original.id}`} className="font-medium hover:underline" data-action="open-detail" data-entity="listing">
        {row.original.title}
      </Link>
    ),
  },
  {
    accessorKey: 'category',
    header: 'Kategori',
    cell: ({ getValue }) => CATEGORY_LABELS[getValue<Listing['category']>()],
  },
  {
    accessorKey: 'status',
    header: 'Durum',
    cell: ({ getValue }) => <ListingStatusBadge status={getValue<Listing['status']>()} />,
  },
  {
    accessorKey: 'aiSuggestion',
    header: 'AI',
    enableSorting: false,
    cell: ({ row }) => <AiSuggestionBadge suggestion={row.original.aiSuggestion} reasons={row.original.aiReasons} />,
  },
  {
    accessorKey: 'il',
    header: 'Şehir',
    cell: ({ getValue }) => LOCATIONS[getValue<string>()]?.label ?? getValue<string>(),
  },
  {
    accessorKey: 'price',
    header: 'Fiyat',
    cell: ({ getValue }) => <span className="tabular-nums">{getValue<number>().toLocaleString('tr-TR')} ₺</span>,
  },
  {
    id: 'actions',
    enableSorting: false,
    enableHiding: false,
    header: () => null,
    cell: ({ row }) => (
      <Button asChild variant="ghost" size="sm">
        <Link to={`/listings/${row.original.id}`} data-action="open-detail" data-entity="listing">
          Detay
        </Link>
      </Button>
    ),
  },
];
