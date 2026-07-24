import type { Intent } from './intent';

/**
 * Guardrailed intent applier. The RED LINE: no AI-originated WRITE happens
 * without an explicit human confirmation. Non-destructive intents (filter,
 * navigate) apply on the user's click; the bulk write path throws unless
 * `confirmed` is true, and it only ever targets AI-OK + pending rows.
 */

/** Minimal shape needed to decide auto-approvability (domain-agnostic). */
export interface Moderatable {
  id: string;
  status: string;
  aiSuggestion: string;
}

/**
 * The ONLY rows the copilot may bulk-approve: pending AND pre-scored OK by AI.
 * Uncertain / NOK are never auto-approved (guardrail — proven by tests).
 */
export function selectApprovable<T extends Moderatable>(items: T[]): T[] {
  return items.filter((i) => i.status === 'pending' && i.aiSuggestion === 'ok');
}

export interface ApplyIntentDeps {
  /** Human confirmation gate. Bulk writes THROW when false. */
  confirmed: boolean;
  /** Navigate to a route (may include a `?search` string). */
  onNavigate: (to: string) => void;
  /** Perform the confirmed bulk approval (writes audit with an `ai:*` actor). */
  onBulkApprove?: (ids: string[]) => Promise<void>;
  /** Ids the caller pre-computed via `selectApprovable` (keeps this domain-free). */
  approvableIds?: string[];
}

export type ApplyResult =
  | { kind: 'navigated'; to: string }
  | { kind: 'filtered'; to: string }
  | { kind: 'approved'; ids: string[] }
  | { kind: 'noop' };

/** Serialize filter params into a deterministic URL search string. */
export function filtersToSearch(filters: Record<string, string | string[]>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (Array.isArray(value)) value.forEach((v) => params.append(key, v));
    else params.set(key, value);
  }
  return params.toString();
}

export async function applyIntent(intent: Intent, deps: ApplyIntentDeps): Promise<ApplyResult> {
  switch (intent.kind) {
    case 'navigate': {
      deps.onNavigate(intent.to);
      return { kind: 'navigated', to: intent.to };
    }
    case 'filter': {
      const search = filtersToSearch(intent.filters);
      const to = search ? `${intent.to}?${search}` : intent.to;
      deps.onNavigate(to);
      return { kind: 'filtered', to };
    }
    case 'bulk-action': {
      // Guardrail: an AI bulk write is inert without explicit confirmation.
      if (!deps.confirmed) {
        throw new Error('AI toplu aksiyonu insan onayı olmadan uygulanamaz.');
      }
      if (!deps.onBulkApprove) {
        throw new Error('Bu bağlamda toplu onay uygulanamıyor.');
      }
      const ids = deps.approvableIds ?? [];
      if (ids.length > 0) await deps.onBulkApprove(ids);
      return { kind: 'approved', ids };
    }
    default:
      return { kind: 'noop' };
  }
}
