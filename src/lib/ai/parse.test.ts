import { describe, expect, it } from 'vitest';

import { intentSchema } from './intent';
import { parseCommand, parseFilters, type ParseContext } from './parse';

const CTX: ParseContext = {
  entity: 'listing',
  routes: { listing: '/listings', user: '/users' },
  modules: [
    { to: '/listings', label: 'İlanlar', entity: 'listing' },
    { to: '/users', label: 'Kullanıcılar & Ofisler', entity: 'user' },
    { to: '/users/agents', label: 'Emlak Ofisleri', entity: 'agent' },
    { to: '/reports', label: 'Raporlar & Analitik', entity: 'report' },
  ],
  categories: [
    { value: 'konut', label: 'Konut' },
    { value: 'arsa', label: 'Arsa' },
    { value: 'isyeri', label: 'İşyeri' },
  ],
  cities: [
    { value: '34', label: 'İstanbul' },
    { value: '06', label: 'Ankara' },
  ],
  statuses: [
    { value: 'pending', label: 'Beklemede', aliases: ['bekleyen', 'beklemede'] },
    { value: 'active', label: 'Yayında', aliases: ['aktif', 'yayında'] },
    { value: 'rejected', label: 'Reddedildi', aliases: ['reddedilen', 'reddedildi'] },
  ],
};

describe('parseCommand — every intent is schema-valid + deterministic', () => {
  it('produces schema-valid intents for a range of inputs', () => {
    for (const input of [
      "İstanbul'da 500 m² üzeri bekleyen arsa",
      'ilanlara git',
      'bekleyen ilanları onayla',
      'anlamsız bir cümle xyzzy',
      '',
    ]) {
      expect(() => intentSchema.parse(parseCommand(input, CTX))).not.toThrow();
    }
  });

  it('is deterministic — same input yields identical output', () => {
    const a = parseCommand("İstanbul'da 500 m² üzeri bekleyen arsa", CTX);
    const b = parseCommand("İstanbul'da 500 m² üzeri bekleyen arsa", CTX);
    expect(a).toEqual(b);
  });
});

describe('parseCommand — filter intent', () => {
  it('extracts category + status + city + area-range from one sentence', () => {
    const intent = parseCommand("İstanbul'da 500 m² üzeri bekleyen arsa", CTX);
    expect(intent.kind).toBe('filter');
    if (intent.kind !== 'filter') return;
    expect(intent.entity).toBe('listing');
    expect(intent.to).toBe('/listings');
    expect(intent.filters).toMatchObject({
      category: 'arsa',
      status: 'pending',
      il: '34',
      grossAreaMin: '500',
    });
  });

  it('reads price "altı" as a Max and "arası" as Min+Max', () => {
    const max = parseFilters('2.000.000 TL altı konut', CTX);
    expect(max.filters).toMatchObject({ category: 'konut', priceMax: '2000000' });
    expect(max.filters.priceMin).toBeUndefined();

    const between = parseFilters('1.000.000 ile 3.000.000 TL arası', CTX);
    expect(between.filters).toMatchObject({ priceMin: '1000000', priceMax: '3000000' });
  });
});

describe('parseCommand — navigate intent', () => {
  it('routes an explicit nav verb + module to a navigate intent', () => {
    const intent = parseCommand('ilanlara git', CTX);
    expect(intent).toEqual({ kind: 'navigate', to: '/listings', label: 'İlanlar' });
  });

  it('prefers the longest matching module label', () => {
    const intent = parseCommand('emlak ofisleri sayfasını aç', CTX);
    expect(intent.kind).toBe('navigate');
    if (intent.kind === 'navigate') expect(intent.to).toBe('/users/agents');
  });

  it('treats "aktif ilanları göster" as a filter, not a bare navigate', () => {
    const intent = parseCommand('aktif ilanları göster', CTX);
    expect(intent.kind).toBe('filter');
    if (intent.kind === 'filter') expect(intent.filters.status).toBe('active');
  });
});

describe('parseCommand — bulk-action intent (guardrailed)', () => {
  it('maps an approve + pending/AI cue to the approve-ai-ok bulk intent', () => {
    const intent = parseCommand('bekleyen ilanları onayla', CTX);
    expect(intent).toEqual({
      kind: 'bulk-action',
      action: 'approve-ai-ok',
      entity: 'listing',
      to: '/listings',
      label: "AI'nın OK verdiği bekleyen ilanları onayla",
    });
  });

  it('does NOT fire on a bare "onayla" without a pending/AI cue', () => {
    const intent = parseCommand('onayla', CTX);
    expect(intent.kind).not.toBe('bulk-action');
  });
});

describe('parseCommand — unknown', () => {
  it('returns unknown when no rule fires (never guesses)', () => {
    expect(parseCommand('xyzzy foo bar', CTX)).toEqual({ kind: 'unknown', input: 'xyzzy foo bar' });
  });

  it('returns unknown for empty input', () => {
    expect(parseCommand('   ', CTX)).toEqual({ kind: 'unknown', input: '' });
  });
});
