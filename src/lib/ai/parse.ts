import type { FilterChip, Intent } from './intent';

/**
 * Deterministic, rule-based command parser (NO LLM). Turns a free-text command
 * into a structured `Intent` using a caller-supplied vocabulary — so the core
 * stays domain-agnostic and single-origin (the feature owns its taxonomy).
 *
 * Determinism rules (012/013 lesson): NO `Date.now()` / argless `new Date()`.
 * Relative-date expressions resolve against `context.today` when provided; if
 * absent, they are ignored rather than guessed.
 */

export interface VocabItem {
  value: string;
  label: string;
  /** Extra Turkish surface forms that also match this value. */
  aliases?: string[];
}

export interface ModuleItem {
  to: string;
  label: string;
  entity?: string;
}

export interface ParseContext {
  /** Current route entity (defaults the filter target when text omits one). */
  entity?: string;
  /** Data-derived "today" (ISO). Only used for relative date phrases. */
  today?: string;
  /** Filterable list routes by entity, e.g. { listing: '/listings' }. */
  routes?: Record<string, string>;
  /** Permitted modules for navigation matching. */
  modules?: ModuleItem[];
  categories?: VocabItem[];
  cities?: VocabItem[];
  /** Status vocabulary WITH Turkish aliases (bekleyen → pending, …). */
  statuses?: VocabItem[];
}

const lc = (s: string) => s.toLocaleLowerCase('tr');

/** Whitespace-insensitive substring match in Turkish locale. */
function includesTerm(haystack: string, term: string): boolean {
  const t = lc(term).trim();
  return t.length > 0 && haystack.includes(t);
}

function matchVocab(text: string, items: VocabItem[] | undefined): VocabItem | undefined {
  if (!items) return undefined;
  for (const item of items) {
    const surfaces = [item.label, ...(item.aliases ?? [])];
    if (surfaces.some((s) => includesTerm(text, s))) return item;
  }
  return undefined;
}

const NAV_VERBS = ['git', 'aç', 'göster', 'gidelim', 'geç'];
const BULK_APPROVE_TERMS = ['onayla', 'onayı ver', 'yayına al'];
const PENDING_TERMS = ['bekleyen', 'beklemede', 'kuyruk'];

/**
 * Parse `input` into an `Intent`. Precedence: bulk-action → navigate → filter →
 * unknown. Unknown is returned whenever no rule fires — the parser never
 * fabricates an intent.
 */
export function parseCommand(input: string, context: ParseContext = {}): Intent {
  const raw = input.trim();
  const text = lc(raw);
  if (!text) return { kind: 'unknown', input: raw };

  const listingRoute = context.routes?.listing ?? '/listings';

  // 1) Bulk action — "AI'nın OK dediği bekleyenleri onayla". Requires an approve
  //    verb AND a pending/AI cue so a bare "onayla" doesn't fire destructively.
  const wantsApprove = BULK_APPROVE_TERMS.some((t) => includesTerm(text, t));
  const mentionsPendingOrAi =
    PENDING_TERMS.some((t) => includesTerm(text, t)) || text.includes('ai') || text.includes('yapay zeka');
  if (wantsApprove && mentionsPendingOrAi) {
    return {
      kind: 'bulk-action',
      action: 'approve-ai-ok',
      entity: 'listing',
      to: listingRoute,
      label: "AI'nın OK verdiği bekleyen ilanları onayla",
    };
  }

  // Collect any filter signals up front (shared by nav + filter branches).
  const filterResult = parseFilters(raw, context);
  const hasFilters = filterResult.chips.length > 0;

  // 2) Navigate — an explicit nav verb + a module match, and NO filter signal
  //    (so "aktif ilanları göster" is treated as a filter, not a bare navigate).
  const wantsNav = NAV_VERBS.some((v) => includesTerm(text, v));
  if (wantsNav && !hasFilters) {
    const mod = matchModule(text, context.modules);
    if (mod) return { kind: 'navigate', to: mod.to, label: mod.label };
  }

  // 3) Filter — proposed filter set applied on the entity's list route.
  if (hasFilters) {
    const entity = filterResult.entity ?? context.entity ?? 'listing';
    const to = context.routes?.[entity] ?? listingRoute;
    return { kind: 'filter', entity, to, filters: filterResult.filters, chips: filterResult.chips };
  }

  // 4) A lone nav verb + module (no filters handled above) still navigates.
  if (wantsNav) {
    const mod = matchModule(text, context.modules);
    if (mod) return { kind: 'navigate', to: mod.to, label: mod.label };
  }

  return { kind: 'unknown', input: raw };
}

function matchModule(text: string, modules: ModuleItem[] | undefined): ModuleItem | undefined {
  if (!modules) return undefined;
  // Prefer the longest label match so "emlak ofisleri" beats "ilanlar".
  const sorted = [...modules].sort((a, b) => b.label.length - a.label.length);
  return sorted.find((m) => includesTerm(text, m.label) || (m.entity ? includesTerm(text, m.entity) : false));
}

export interface FilterParseResult {
  entity?: string;
  filters: Record<string, string | string[]>;
  chips: FilterChip[];
}

const PRICE_UNIT = /(tl|₺|lira)/;

/**
 * Deterministic NL → filter-param parser. Recognises category / city / status
 * vocabulary plus numeric price (tl) and area (m²) ranges with
 * üzeri/altı/arası/en az/en fazla qualifiers. Returns proposed params + chips.
 */
export function parseFilters(input: string, context: ParseContext = {}): FilterParseResult {
  const text = lc(input);
  const filters: Record<string, string | string[]> = {};
  const chips: FilterChip[] = [];
  const push = (key: string, value: string, label: string) => {
    filters[key] = value;
    chips.push({ key, value, label });
  };

  const cat = matchVocab(text, context.categories);
  if (cat) push('category', cat.value, `Kategori: ${cat.label}`);

  const status = matchVocab(text, context.statuses);
  if (status) push('status', status.value, `Durum: ${status.label}`);

  const city = matchVocab(text, context.cities);
  if (city) push('il', city.value, `İl: ${city.label}`);

  // Numeric ranges. Grab number groups near a unit + qualifier.
  const numbers = extractNumbers(text);
  const priceIdx = text.search(PRICE_UNIT);
  const areaIdx = text.search(/m²|m2|metrekare/);

  applyRange(text, numbers, priceIdx, 'price', 'Fiyat', '₺', push);
  applyRange(text, numbers, areaIdx, 'grossArea', 'Brüt alan', 'm²', push);

  return { entity: 'listing', filters, chips };
}

interface NumberToken {
  value: number;
  index: number;
}

/** Extract integer tokens (thousands separators / dots stripped) with positions. */
function extractNumbers(text: string): NumberToken[] {
  const out: NumberToken[] = [];
  const re = /\d[\d.,]*/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const digits = m[0].replace(/[.,]/g, '');
    if (digits.length > 0) out.push({ value: Number(digits), index: m.index });
  }
  return out;
}

const MIN_QUALIFIERS = ['üzeri', 'üstü', 'fazla', 'en az', 'minimum', 'büyük', '+'];
const MAX_QUALIFIERS = ['altı', 'aşağı', 'az', 'en fazla', 'maksimum', 'küçük', 'kadar'];

/**
 * Attach the number nearest a unit marker as a min/max param. `üzeri/altı`
 * (and synonyms) decide direction; `arası` with two numbers sets both.
 */
function applyRange(
  text: string,
  numbers: NumberToken[],
  unitIndex: number,
  key: string,
  label: string,
  unit: string,
  push: (key: string, value: string, label: string) => void,
): void {
  if (unitIndex < 0 || numbers.length === 0) return;
  // Numbers closest to the unit marker are the relevant ones.
  const near = [...numbers].sort((a, b) => Math.abs(a.index - unitIndex) - Math.abs(b.index - unitIndex));

  if (text.includes('arası') && near.length >= 2) {
    const [a, b] = [near[0]!.value, near[1]!.value].sort((x, y) => x - y);
    push(`${key}Min`, String(a), `${label}: ${a}${unit}'den`);
    push(`${key}Max`, String(b), `${label}: ${b}${unit}'e`);
    return;
  }

  const n = near[0]!.value;
  const isMax = MAX_QUALIFIERS.some((q) => text.includes(q));
  const isMin = MIN_QUALIFIERS.some((q) => text.includes(q));
  if (isMax && !isMin) {
    push(`${key}Max`, String(n), `${label}: ${n}${unit} altı`);
  } else if (isMin) {
    push(`${key}Min`, String(n), `${label}: ${n}${unit} üzeri`);
  }
}
