import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface DataTablePaginationProps {
  page: number;
  pageSize: number;
  total: number;
  selectedCount?: number;
  pageSizeOptions?: number[];
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (size: number) => void;
}

/** Server-driven pagination controls with page-size selection. */
export function DataTablePagination({
  page,
  pageSize,
  total,
  selectedCount = 0,
  pageSizeOptions = [10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col items-stretch gap-3 px-1 py-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-muted-foreground order-2 text-center text-sm tabular-nums sm:order-1 sm:text-left">
        {selectedCount > 0 && <span className="mr-2">{selectedCount} seçili ·</span>}
        {from}–{to} / {total} kayıt
      </div>
      <div className="order-1 flex items-center justify-between gap-2 sm:order-2 sm:justify-end sm:gap-4">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground hidden text-sm sm:inline">Sayfa boyutu</span>
          <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
            <SelectTrigger size="sm" className="w-[4.5rem]" aria-label="Sayfa boyutu">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Compact `x/y` counter on phones; full label from sm (480) up. */}
          <span className="text-muted-foreground whitespace-nowrap text-sm tabular-nums">
            <span className="hidden sm:inline">Sayfa </span>
            {page}/{pageCount}
          </span>
          <div className="flex items-center gap-1">
            {/* First/last hidden on the smallest widths; prev/next always shown. */}
            <Button variant="outline" size="icon" className="hidden sm:inline-flex" disabled={page <= 1} onClick={() => onPageChange(0)} aria-label="İlk sayfa">
              <ChevronsLeft className="size-4" />
            </Button>
            <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => onPageChange(page - 2)} aria-label="Önceki sayfa">
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="outline" size="icon" disabled={page >= pageCount} onClick={() => onPageChange(page)} aria-label="Sonraki sayfa">
              <ChevronRight className="size-4" />
            </Button>
            <Button variant="outline" size="icon" className="hidden sm:inline-flex" disabled={page >= pageCount} onClick={() => onPageChange(pageCount - 1)} aria-label="Son sayfa">
              <ChevronsRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
