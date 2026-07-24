import { useState } from 'react';
import { Check, ArrowUpFromLine, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FieldHelp } from '@/components/form/FieldHelp';
import { Can } from '@/lib/permissions/permission-context';
import type { ReportActionInput } from '../schemas/report';

const REASON_HELP: Record<'dismiss' | 'escalate', string> = {
  dismiss: 'Şikayetin neden geçersiz sayıldığını açıkça belirtin; karar denetim kaydına yazılır.',
  escalate: 'Şikayetin neden üst mercie taşındığını açıklayın; ilgili ekip için not olarak kalır.',
};

export interface ReportDecisionProps {
  onDecide: (input: ReportActionInput) => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
}

/**
 * Three-tier complaint moderation: OK resolves, Belirsiz escalates, NOK
 * dismisses. Escalate/dismiss require a reason captured in a focus-managed
 * popover. Purpose-built (not the listing-coupled ModerationDecision) and gated
 * by a single `message.moderate` permission.
 */
export function ReportDecision({ onDecide, loading = false, disabled = false }: ReportDecisionProps) {
  return (
    <Can permission="message.moderate">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Şikayet moderasyon kararı">
        <Button
          variant="default"
          onClick={() => void onDecide({ action: 'resolve' })}
          loading={loading}
          disabled={disabled}
          data-action="resolve"
          data-entity="report"
        >
          <Check className="size-4" /> OK — Çözüldü
        </Button>
        <ReasonDecision
          action="escalate"
          label="Belirsiz — Üst mercie taşı"
          icon={ArrowUpFromLine}
          variant="outline"
          onDecide={onDecide}
          disabled={disabled || loading}
        />
        <ReasonDecision
          action="dismiss"
          label="NOK — Reddet"
          icon={X}
          variant="destructive"
          onDecide={onDecide}
          disabled={disabled || loading}
        />
      </div>
    </Can>
  );
}

function ReasonDecision({
  action,
  label,
  icon: Icon,
  variant,
  onDecide,
  disabled,
}: {
  action: 'dismiss' | 'escalate';
  label: string;
  icon: typeof Check;
  variant: React.ComponentProps<typeof Button>['variant'];
  onDecide: (input: ReportActionInput) => void | Promise<void>;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const invalid = reason.trim().length === 0;

  const submit = async () => {
    if (invalid) return;
    setSubmitting(true);
    try {
      await onDecide({ action, reason: reason.trim() });
      setOpen(false);
      setReason('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant={variant} disabled={disabled} data-action={action} data-entity="report">
          <Icon className="size-4" /> {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-2" align="start">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor={`report-reason-${action}`}>Gerekçe (zorunlu)</Label>
          <FieldHelp help={REASON_HELP[action]} label="Gerekçe hakkında yardım" />
        </div>
        <Textarea
          id={`report-reason-${action}`}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Kararın gerekçesini yazın…"
          aria-invalid={invalid}
          aria-describedby={`report-reason-${action}-help`}
          rows={3}
        />
        <p id={`report-reason-${action}-help`} className="text-muted-foreground text-xs">
          Bu gerekçe denetim kaydına yazılır.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Vazgeç
          </Button>
          <Button
            size="sm"
            onClick={() => void submit()}
            loading={submitting}
            disabled={invalid}
            data-action={`confirm-${action}`}
            data-entity="report"
          >
            Onayla
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
