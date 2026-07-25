import { DayPicker } from 'react-day-picker';
import { tr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { buttonVariants } from './button';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

/** Token-styled calendar built on react-day-picker (Turkish locale). */
function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      locale={tr}
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col md:flex-row gap-2',
        month: 'flex flex-col gap-4',
        month_caption: 'flex justify-center pt-1 relative items-center h-9',
        caption_label: 'text-sm font-medium',
        nav: 'flex items-center gap-1 absolute inset-x-0 top-0 justify-between',
        button_previous: cn(buttonVariants({ variant: 'outline', size: 'icon' }), 'size-7 p-0'),
        button_next: cn(buttonVariants({ variant: 'outline', size: 'icon' }), 'size-7 p-0'),
        month_grid: 'w-full border-collapse space-y-1',
        weekdays: 'flex',
        weekday: 'text-muted-foreground rounded-md w-9 text-[0.75rem] font-normal',
        week: 'flex w-full mt-2',
        day: 'size-9 text-center text-sm p-0 relative',
        day_button: cn(
          buttonVariants({ variant: 'ghost', size: 'icon' }),
          'size-9 p-0 font-normal aria-selected:opacity-100',
        ),
        selected:
          '[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary',
        today: '[&>button]:bg-accent [&>button]:text-accent-foreground',
        outside: 'text-muted-foreground opacity-50',
        disabled: 'text-muted-foreground opacity-50',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === 'left' ? (
            <ChevronLeft className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          ),
      }}
      {...props}
    />
  );
}

export { Calendar };
