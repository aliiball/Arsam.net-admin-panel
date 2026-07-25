import { useState } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface DatePickerProps {
  value?: Date | undefined;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
  'aria-label'?: string;
}

/** Single-date picker: Button trigger + Popover calendar (Turkish locale). */
export function DatePicker({
  value,
  onChange,
  placeholder = 'Tarih seçin',
  disabled,
  id,
  className,
  ...aria
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          aria-invalid={aria['aria-invalid']}
          aria-describedby={aria['aria-describedby']}
          aria-label={aria['aria-label']}
          className={cn('w-full justify-start gap-2 font-normal', !value && 'text-muted-foreground', className)}
          data-action="open-datepicker"
          data-entity="field"
        >
          <CalendarIcon className="size-4" />
          {value ? format(value, 'PPP', { locale: tr }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange?.(date);
            setOpen(false);
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
