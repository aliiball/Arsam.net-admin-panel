/** Category + location + attribute taxonomy for the listings (emlak) vertical. */

export const CATEGORIES = ['konut', 'isyeri', 'arsa', 'devremulk', 'turistik'] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  konut: 'Konut',
  isyeri: 'İşyeri',
  arsa: 'Arsa',
  devremulk: 'Devremülk',
  turistik: 'Turistik Tesis',
};

export const STATUSES = ['draft', 'pending', 'active', 'expired', 'archived', 'rejected'] as const;
export type ListingStatus = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<ListingStatus, string> = {
  draft: 'Taslak',
  pending: 'Beklemede',
  active: 'Yayında',
  expired: 'Süresi doldu',
  archived: 'Arşivlendi',
  rejected: 'Reddedildi',
};

export const HEATING = ['dogalgaz', 'merkezi', 'klima', 'soba', 'yok'] as const;
export const HEATING_LABELS: Record<(typeof HEATING)[number], string> = {
  dogalgaz: 'Doğalgaz (kombi)',
  merkezi: 'Merkezi',
  klima: 'Klima',
  soba: 'Soba',
  yok: 'Yok',
};

export const DEED_STATUS = ['kat-mulkiyeti', 'kat-irtifaki', 'hisseli', 'mustakil'] as const;
export const DEED_LABELS: Record<(typeof DEED_STATUS)[number], string> = {
  'kat-mulkiyeti': 'Kat Mülkiyeti',
  'kat-irtifaki': 'Kat İrtifakı',
  hisseli: 'Hisseli Tapu',
  mustakil: 'Müstakil Tapu',
};

export const ZONING = ['konut', 'ticari', 'tarla', 'sanayi', 'imarsiz'] as const;
export const ZONING_LABELS: Record<(typeof ZONING)[number], string> = {
  konut: 'Konut İmarlı',
  ticari: 'Ticari İmarlı',
  tarla: 'Tarla',
  sanayi: 'Sanayi',
  imarsiz: 'İmarsız',
};

/** Which attributes each category exposes in its dynamic form. */
export const CATEGORY_ATTRIBUTES: Record<Category, string[]> = {
  konut: ['grossArea', 'netArea', 'rooms', 'buildingAge', 'floor', 'heating', 'deedStatus'],
  isyeri: ['grossArea', 'netArea', 'floor', 'heating', 'deedStatus'],
  arsa: ['grossArea', 'deedStatus', 'zoning'],
  devremulk: ['grossArea', 'rooms', 'heating'],
  turistik: ['grossArea', 'rooms', 'heating'],
};

/** Cascading il → ilçe → mahalle sample data. */
export const LOCATIONS: Record<string, { label: string; districts: Record<string, { label: string; neighborhoods: string[] }> }> = {
  '34': {
    label: 'İstanbul',
    districts: {
      kadikoy: { label: 'Kadıköy', neighborhoods: ['Moda', 'Caferağa', 'Fenerbahçe'] },
      besiktas: { label: 'Beşiktaş', neighborhoods: ['Levent', 'Etiler', 'Bebek'] },
    },
  },
  '06': {
    label: 'Ankara',
    districts: {
      cankaya: { label: 'Çankaya', neighborhoods: ['Kızılay', 'Bahçelievler'] },
      kecioren: { label: 'Keçiören', neighborhoods: ['Etlik', 'Aktepe'] },
    },
  },
  '35': {
    label: 'İzmir',
    districts: {
      konak: { label: 'Konak', neighborhoods: ['Alsancak', 'Göztepe'] },
      bornova: { label: 'Bornova', neighborhoods: ['Kazımdirik', 'Erzene'] },
    },
  },
};

export function ilOptions() {
  return Object.entries(LOCATIONS).map(([value, { label }]) => ({ value, label }));
}
export function ilceOptions(il: string) {
  const d = LOCATIONS[il]?.districts ?? {};
  return Object.entries(d).map(([value, { label }]) => ({ value, label }));
}
export function mahalleOptions(il: string, ilce: string) {
  const list = LOCATIONS[il]?.districts[ilce]?.neighborhoods ?? [];
  return list.map((m) => ({ value: m, label: m }));
}
