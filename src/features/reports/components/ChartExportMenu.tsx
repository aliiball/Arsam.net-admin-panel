import { Download } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { exportCsv, exportXls } from '@/lib/export';

export interface ChartExportMenuProps {
  /** File base name (no extension). */
  filename: string;
  headers: string[];
  rows: string[][];
  /** Accessible label for the trigger (defaults to a generic export label). */
  label?: string;
}

/** Per-chart CSV/XLS export of the chart's underlying data table. */
export function ChartExportMenu({ filename, headers, rows, label = 'Dışa aktar' }: ChartExportMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0"
          aria-label={label}
          data-action="open-export"
          data-entity="report"
        >
          <Download className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuItem
          onSelect={() => exportCsv(filename, headers, rows)}
          data-action="export"
          data-entity="report"
        >
          CSV olarak indir
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => exportXls(filename, headers, rows)}
          data-action="export"
          data-entity="report"
        >
          Excel (.xls)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
