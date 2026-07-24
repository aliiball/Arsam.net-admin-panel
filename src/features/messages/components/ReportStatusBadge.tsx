import { Badge } from '@/components/ui/badge';
import { REPORT_STATUS_LABELS, type ReportStatus } from '../data/reports';

const VARIANT: Record<ReportStatus, React.ComponentProps<typeof Badge>['variant']> = {
  open: 'warning',
  resolved: 'success',
  dismissed: 'secondary',
  escalated: 'destructive',
};

/** Text label carries the meaning; color is a secondary signal. */
export function ReportStatusBadge({ status }: { status: ReportStatus }) {
  return <Badge variant={VARIANT[status]}>{REPORT_STATUS_LABELS[status]}</Badge>;
}
