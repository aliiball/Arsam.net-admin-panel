import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Quote } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { getAuditFor } from '@/lib/audit';
import { AuditTimeline } from '@/features/audit';
import { REPORT_SUBJECT_TYPE_LABELS } from '../data/reports';
import { useReport } from '../api/queries';
import { useReportAction } from '../api/mutations';
import { ReportStatusBadge } from '../components/ReportStatusBadge';
import { ReportPriorityBadge } from '../components/ReportPriorityBadge';
import { ReasonCategoryBadge } from '../components/ReasonCategoryBadge';
import { ReportDecision } from '../components/ReportDecision';
import type { Report } from '../schemas/report';

/** Route to the reported subject (listing/user have detail pages; message does not). */
function subjectLink(report: Report): string | undefined {
  if (report.subjectType === 'listing') return `/listings/${report.subjectId}`;
  if (report.subjectType === 'user') return `/users/${report.subjectId}`;
  return undefined;
}

export function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: report, isLoading, isError, refetch } = useReport(id);
  const act = useReportAction(id ?? '');

  if (isLoading) return <LoadingState label="Şikayet yükleniyor…" />;
  if (isError || !report) return <ErrorState title="Şikayet bulunamadı" onRetry={() => void refetch()} />;

  const audit = getAuditFor(`report:${report.id}`);
  const link = subjectLink(report);
  const open = report.status === 'open' || report.status === 'escalated';

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to="/messages" data-action="navigate" data-entity="report">
            <ArrowLeft className="size-4" /> Şikayetler
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-xl">{report.subjectLabel}</CardTitle>
              <CardDescription>
                {REPORT_SUBJECT_TYPE_LABELS[report.subjectType]} · {report.subjectId} · Şikayet eden: {report.reporterName}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ReportPriorityBadge priority={report.priority} />
              <ReportStatusBadge status={report.status} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:grid-cols-3">
            <Field label="Şikayet No" value={report.id} />
            <div>
              <dt className="text-muted-foreground text-xs">Sebep</dt>
              <dd className="mt-1">
                <ReasonCategoryBadge category={report.reasonCategory} />
              </dd>
            </div>
            <Field label="Tarih" value={new Date(report.createdAt).toLocaleString('tr-TR')} />
            <div>
              <dt className="text-muted-foreground text-xs">Konu</dt>
              <dd className="mt-1">
                {link ? (
                  <Link to={link} className="text-primary hover:underline" data-action="open-subject" data-entity="report">
                    {report.subjectLabel}
                  </Link>
                ) : (
                  report.subjectLabel
                )}
              </dd>
            </div>
          </dl>

          <Separator />
          <div className="space-y-1">
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              <Quote className="size-3" aria-hidden="true" /> Alıntılanan içerik
            </span>
            <blockquote className="bg-muted border-border rounded-md border-l-2 px-3 py-2 text-sm">
              {report.description}
            </blockquote>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Moderasyon</CardTitle>
          <CardDescription>AI önerir, siz karar verirsiniz. Her karar denetim kaydına yazılır.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {open ? (
            <ReportDecision
              onDecide={async (input) => {
                await act.mutateAsync(input);
              }}
              loading={act.isPending}
            />
          ) : (
            <p className="text-muted-foreground text-sm">Bu şikayet kapatıldı; ek işlem yapılamaz.</p>
          )}

          {audit.length > 0 && (
            <>
              <Separator />
              <AuditTimeline entries={audit} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | undefined }) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="tabular-nums">{value ?? '—'}</dd>
    </div>
  );
}
