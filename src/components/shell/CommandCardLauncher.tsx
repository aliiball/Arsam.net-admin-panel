import * as React from 'react';
import { useLocation, useMatches, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Filter,
  Monitor,
  Moon,
  PanelLeft,
  PanelTop,
  Rows3,
  Search,
  Send,
  Sparkles,
  Sun,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldHelp } from '@/components/form/FieldHelp';
import { hasRouteMeta } from '@/app/route-meta';
import { useLayout } from '@/lib/layout/layout-context';
import { setAssistantOpen } from '@/lib/ai';
import { applyIntent, parseCommand, type Intent } from '@/lib/ai';
import { useSession } from '@/lib/permissions/permission-context';
import { usePermissionMatrix } from '@/lib/permissions/permission-store';
import { ROLE_LABELS } from '@/lib/permissions/permissions';
import { navSchema } from '@/config/nav-schema';
import { buildAssistantContext } from '@/components/ai/assistant-context';
import { filterNavByRole, isNavItemActive } from './nav-utils';
import { useCommandPalette } from './command-palette-context';

const NL_EXAMPLES = [
  "İstanbul'da 500 m² üzeri bekleyen arsa",
  'kullanıcılara git',
  'aktif ilanları göster',
];

const KBD =
  'bg-muted text-muted-foreground pointer-events-none inline-flex select-none items-center rounded border border-border px-1 font-mono text-[0.625rem]';

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * Command center — the ⌘K surface in `dock` mode. Re-derived to the reference
 * DynamicIsland palette shape (identity header → natural-language box → module
 * search → NAVIGATION icon-tile grid → quick actions → keyboard-hint footer), in
 * OUR tokens. Permitted modules render as compact icon tiles; the active module
 * is marked. The NL box keeps the guardrail: it PROPOSES a navigate/filter intent
 * that applies only on the user's confirm; write-class (bulk) intents are handed
 * off to the AI assistant (which owns the confirm flow). The list palette
 * (`CommandPalette`) still serves sidebar/topnav unchanged.
 */
export function CommandCardLauncher() {
  const { open, setOpen } = useCommandPalette();
  const navigate = useNavigate();
  const matches = useMatches();
  const { pathname } = useLocation();
  const { user } = useSession();
  const matrix = usePermissionMatrix();
  const { setMode, setTheme, toggleDensity } = useLayout();

  const modules = React.useMemo(
    () => filterNavByRole(navSchema, user.role, matrix),
    [user.role, matrix],
  );

  const contextEntity = React.useMemo(() => {
    const withMeta = matches.filter((m) => hasRouteMeta(m.handle));
    const last = withMeta[withMeta.length - 1];
    return last && hasRouteMeta(last.handle) ? last.handle.routeMeta.aiEntity : undefined;
  }, [matches]);
  const parseCtx = React.useMemo(
    () => buildAssistantContext(user.role, matrix, contextEntity),
    [user.role, matrix, contextEntity],
  );

  const [q, setQ] = React.useState('');
  const [nl, setNl] = React.useState('');
  const [intent, setIntent] = React.useState<Intent | null>(null);

  const query = q.toLocaleLowerCase('tr').trim();
  const filtered = query
    ? modules.filter((m) =>
        `${m.label} ${m.description ?? ''}`.toLocaleLowerCase('tr').includes(query),
      )
    : modules;

  const reset = () => {
    setQ('');
    setNl('');
    setIntent(null);
  };
  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) reset();
  };

  const go = (to: string) => {
    navigate(to);
    onOpenChange(false);
  };

  const runParse = () => setIntent(parseCommand(nl, parseCtx));

  const applyProposed = async (i: Intent) => {
    if (i.kind === 'bulk-action') {
      // Write-class intent — hand off to the AI assistant's confirm flow.
      setAssistantOpen(true);
      onOpenChange(false);
      return;
    }
    await applyIntent(i, { confirmed: true, onNavigate: go });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Morph-open: anchored just below the dock pill (top-16) and scaled up from
          its top edge (origin-top + slide-from-top) over a longer, eased duration,
          so the command center reads as expanding OUT of the pill rather than
          popping in the screen center. Overrides the Dialog's default centered zoom. */}
      <DialogContent className="top-16 max-h-[calc(100dvh-5rem)] w-[calc(100%-2rem)] origin-top translate-y-0 gap-4 overflow-y-auto duration-500 data-[state=closed]:slide-out-to-top-8 data-[state=open]:slide-in-from-top-8 sm:max-w-2xl">
        {/* Identity header (avatar + name + role badge). The built-in close X sits
            top-right; the accessible title/description satisfy the Dialog contract. */}
        <DialogHeader className="flex-row items-center gap-3 space-y-0 pr-10 text-left">
          <Avatar className="size-9 shrink-0">
            <AvatarFallback>{initials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <DialogTitle className="flex items-center gap-2 text-base">
              <span className="truncate">{user.name}</span>
              <Badge variant="secondary" className="shrink-0 font-normal">
                {ROLE_LABELS[user.role]}
              </Badge>
            </DialogTitle>
            <DialogDescription className="sr-only">
              İzinli modüllere geçin, komut arayın veya doğal dille bir eylem önerin.
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Natural-language box (propose → confirm; no write without approval) */}
        <div className="space-y-2 rounded-md border border-border bg-muted/30 p-3">
          <div className="flex items-center gap-1">
            <Label htmlFor="launcher-nl">Doğal dil komutu</Label>
            <FieldHelp
              label="Komut yardımı"
              help={
                <div className="space-y-1 text-sm">
                  <p>Deterministik, kural tabanlı kopilot (LLM yok). Örnekler:</p>
                  <ul className="list-inside list-disc">
                    {NL_EXAMPLES.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                </div>
              }
            />
          </div>
          <div className="flex gap-2">
            <Input
              id="launcher-nl"
              value={nl}
              onChange={(e) => setNl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  runParse();
                }
              }}
              placeholder="Örn. İstanbul'da bekleyen arsa ilanları"
              aria-describedby="launcher-nl-help"
              data-action="type-command"
              data-entity="command"
            />
            <Button
              onClick={runParse}
              disabled={!nl.trim()}
              className="shrink-0"
              data-action="parse-command"
              data-entity="command"
            >
              <Send className="size-4" /> Yorumla
            </Button>
          </div>
          <span id="launcher-nl-help" className="sr-only">
            Deterministik, kural tabanlı bir kopilottur. Filtre veya sayfa geçişi ifadeleri yazın; öneri
            onaylanmadan uygulanmaz. Örnek: {NL_EXAMPLES.join('; ')}.
          </span>
          {intent && <ProposedIntent intent={intent} onApply={applyProposed} onDismiss={() => setIntent(null)} />}
        </div>

        {/* Module search */}
        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" aria-hidden />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Modül ara…"
            className="pl-9"
            aria-label="Modül ara"
            data-action="search"
            data-entity="command"
          />
        </div>

        {/* Navigation — compact icon-tile grid (active module marked). */}
        <section className="space-y-2">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Navigasyon</p>
          {filtered.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center text-sm">Sonuç bulunamadı.</p>
          ) : (
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {filtered.map((mod) => {
                const Icon = mod.icon;
                const active = isNavItemActive(mod.to, pathname);
                return (
                  <li key={mod.id}>
                    <button
                      type="button"
                      onClick={() => go(mod.to)}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'focus-visible:ring-ring flex h-full w-full flex-col items-center gap-1.5 rounded-lg border p-3 text-center outline-none transition-colors focus-visible:ring-2',
                        active
                          ? 'border-primary/40 bg-accent/50'
                          : 'border-border/60 hover:border-primary/40 hover:bg-accent/40',
                      )}
                      data-action="navigate"
                      data-entity={mod.aiEntity ?? 'module'}
                    >
                      <span
                        className={cn(
                          'flex size-10 items-center justify-center rounded-md',
                          active ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary',
                        )}
                      >
                        <Icon className="size-5" aria-hidden />
                      </span>
                      <span className="w-full truncate text-xs font-medium">{mod.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Quick actions — grouped so related controls read as one cluster. */}
        <section className="space-y-3">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Hızlı komutlar</p>
          <QuickGroup label="Genel">
            <QuickAction icon={Sparkles} label="AI Asistanı" onClick={() => { setAssistantOpen(true); onOpenChange(false); }} action="open-assistant" />
          </QuickGroup>
          <QuickGroup label="Görünüm">
            <QuickAction icon={PanelLeft} label="Kenar çubuğu" onClick={() => { setMode('sidebar'); onOpenChange(false); }} action="set-layout-mode" />
            <QuickAction icon={PanelTop} label="Üst menü" onClick={() => { setMode('topnav'); onOpenChange(false); }} action="set-layout-mode" />
            <QuickAction icon={Rows3} label="Yoğunluk" onClick={() => toggleDensity()} action="toggle-density" />
          </QuickGroup>
          <QuickGroup label="Tema">
            <QuickAction icon={Sun} label="Aydınlık" onClick={() => setTheme('light')} action="set-theme" />
            <QuickAction icon={Moon} label="Koyu" onClick={() => setTheme('dark')} action="set-theme" />
            <QuickAction icon={Monitor} label="Sistem" onClick={() => setTheme('system')} action="set-theme" />
          </QuickGroup>
        </section>

        {/* Footer — keyboard hints + assistant status (matches the reference chrome). */}
        <div className="flex items-center justify-between gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1">
              <kbd className={KBD}>Tab</kbd> gezin
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className={KBD}>↵</kbd> seç
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className={KBD}>Esc</kbd> kapat
            </span>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5">
            <span className="bg-success size-1.5 rounded-full" aria-hidden />
            AI hazır
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function QuickGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-muted-foreground w-14 shrink-0 text-xs">{label}</span>
      {children}
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  onClick,
  action,
}: {
  icon: typeof Sparkles;
  label: string;
  onClick: () => void;
  action: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex min-h-11 items-center gap-1.5 rounded-md border border-border px-3 text-xs outline-none transition-colors focus-visible:ring-2"
      data-action={action}
      data-entity="layout"
    >
      <Icon className="size-3.5" aria-hidden />
      {label}
    </button>
  );
}

function ProposedIntent({
  intent,
  onApply,
  onDismiss,
}: {
  intent: Intent;
  onApply: (i: Intent) => void | Promise<void>;
  onDismiss: () => void;
}) {
  return (
    <div className="space-y-2 rounded-md border border-border bg-background p-3" role="group" aria-label="Önerilen aksiyon">
      {intent.kind === 'filter' && (
        <>
          <IntentHeader icon={Filter} title="Önerilen filtre" />
          <div className="flex flex-wrap gap-1">
            {intent.chips.map((c) => (
              <Badge key={`${c.key}-${c.value}`} variant="secondary">
                {c.label}
              </Badge>
            ))}
          </div>
          <IntentActions confirmLabel="Uygula" onConfirm={() => onApply(intent)} onDismiss={onDismiss} />
        </>
      )}
      {intent.kind === 'navigate' && (
        <>
          <IntentHeader icon={ArrowRight} title="Sayfaya git" />
          <p className="text-sm">
            <span className="font-medium">{intent.label}</span> sayfasına gidilecek.
          </p>
          <IntentActions confirmLabel="Git" onConfirm={() => onApply(intent)} onDismiss={onDismiss} />
        </>
      )}
      {intent.kind === 'bulk-action' && (
        <>
          <IntentHeader icon={Bot} title="AI toplu aksiyonu" />
          <p className="text-muted-foreground text-sm">
            Yazma işlemleri AI asistanının onay akışında yürütülür. Devam etmek için asistanı açın.
          </p>
          <IntentActions confirmLabel="Asistanı aç" onConfirm={() => onApply(intent)} onDismiss={onDismiss} />
        </>
      )}
      {intent.kind === 'unknown' && (
        <>
          <IntentHeader icon={Bot} title="Komut anlaşılamadı" />
          <p className="text-muted-foreground text-sm">
            Filtre veya sayfa geçişi ifadeleri deneyin (ör. “kullanıcılara git”).
          </p>
          <Button variant="ghost" size="sm" className="min-h-11" onClick={onDismiss} data-action="dismiss-intent" data-entity="command">
            Kapat
          </Button>
        </>
      )}
    </div>
  );
}

function IntentHeader({ icon: Icon, title }: { icon: typeof Sparkles; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="text-primary size-4" aria-hidden />
      <p className="text-sm font-medium">{title}</p>
    </div>
  );
}

function IntentActions({
  confirmLabel,
  onConfirm,
  onDismiss,
}: {
  confirmLabel: string;
  onConfirm: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="flex gap-2">
      <Button size="sm" className="min-h-11" onClick={onConfirm} data-action="apply-intent" data-entity="command">
        <CheckCircle2 className="size-4" /> {confirmLabel}
      </Button>
      <Button size="sm" variant="ghost" className="min-h-11" onClick={onDismiss} data-action="dismiss-intent" data-entity="command">
        Vazgeç
      </Button>
    </div>
  );
}
