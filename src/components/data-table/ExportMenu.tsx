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

export type ExportScope = 'view' | 'selection' | 'all';
export type ExportFormat = 'csv' | 'xls';

export interface ExportMenuProps {
  selectedCount?: number;
  onExport: (format: ExportFormat, scope: ExportScope) => void | Promise<void>;
}

/** CSV / Excel export for current view, selection, or all-matching. */
export function ExportMenu({ selectedCount = 0, onExport }: ExportMenuProps) {
  const scopes: { scope: ExportScope; label: string; disabled?: boolean }[] = [
    { scope: 'view', label: 'Bu sayfa' },
    { scope: 'selection', label: `Seçili (${selectedCount})`, disabled: selectedCount === 0 },
    { scope: 'all', label: 'Tüm eşleşenler' },
  ];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" data-action="open-export" data-entity="table">
          <Download className="size-4" />
          <span className="hidden sm:inline">Dışa aktar</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {(['csv', 'xls'] as const).map((format) => (
          <div key={format}>
            <DropdownMenuLabel className="uppercase">{format}</DropdownMenuLabel>
            {scopes.map(({ scope, label, disabled }) => (
              <DropdownMenuItem
                key={`${format}-${scope}`}
                disabled={disabled ?? false}
                onSelect={() => void onExport(format, scope)}
                data-action="export"
                data-entity="table"
              >
                {label}
              </DropdownMenuItem>
            ))}
            {format === 'csv' && <DropdownMenuSeparator />}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
