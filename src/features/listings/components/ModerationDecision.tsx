import { useState } from 'react';
import { Check, CircleHelp, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Can } from '@/lib/permissions/permission-context';
import type { ModerationDecision as Decision, ModerationInput } from '../schemas/listing';

export interface ModerationDecisionProps {
  onDecide: (input: ModerationInput) => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
}

/** Three-tier moderation control: OK publishes, Uncertain holds, NOK rejects.
 *  Uncertain/NOK require a reason (captured in a focus-managed popover). */
export function ModerationDecision({ onDecide, loading = false, disabled = false }: ModerationDecisionProps) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Moderasyon kararı">
      <Can permission="listing.approve">
        <Button
          variant="default"
          onClick={() => void onDecide({ decision: 'ok' })}
          loading={loading}
          disabled={disabled}
          data-action="approve"
          data-entity="listing"
        >
          <Check className="size-4" /> OK — Yayınla
        </Button>
      </Can>
      <ReasonDecision
        decision="uncertain"
        label="Belirsiz — Beklet"
        icon={CircleHelp}
        variant="outline"
        onDecide={onDecide}
        disabled={disabled || loading}
      />
      <Can permission="listing.reject">
        <ReasonDecision
          decision="nok"
          label="NOK — Reddet"
          icon={X}
          variant="destructive"
          onDecide={onDecide}
          disabled={disabled || loading}
        />
      </Can>
    </div>
  );
}

function ReasonDecision({
  decision,
  label,
  icon: Icon,
  variant,
  onDecide,
  disabled,
}: {
  decision: Decision;
  label: string;
  icon: typeof Check;
  variant: React.ComponentProps<typeof Button>['variant'];
  onDecide: (input: ModerationInput) => void | Promise<void>;
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
      await onDecide({ decision, reason: reason.trim() });
      setOpen(false);
      setReason('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant={variant} disabled={disabled} data-action={decision === 'nok' ? 'reject' : 'hold'} data-entity="listing">
          <Icon className="size-4" /> {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-2" align="start">
        <Label htmlFor={`reason-${decision}`}>Gerekçe (zorunlu)</Label>
        <Textarea
          id={`reason-${decision}`}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Kararın gerekçesini yazın…"
          aria-invalid={invalid}
          rows={3}
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Vazgeç
          </Button>
          <Button size="sm" onClick={() => void submit()} loading={submitting} disabled={invalid} data-action="confirm-decision" data-entity="listing">
            Onayla
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
