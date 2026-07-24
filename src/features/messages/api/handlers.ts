import { http, HttpResponse } from 'msw';

import { API_BASE_URL } from '@/lib/api/client';
import type { Paginated } from '@/lib/api/types';
import { writeAudit } from '@/lib/audit';
import {
  REASON_CATEGORIES,
  REPORT_ACTION_STATUS,
  REPORT_PRIORITIES,
  REPORT_STATUSES,
  REPORT_SUBJECT_TYPES,
  type ReasonCategory,
  type ReportSubjectType,
} from '../data/reports';
import { reportActionSchema, type Report, type ReportActionInput } from '../schemas/report';

const REPORTERS = ['Ahmet Yılmaz', 'Ayşe Kaya', 'Mehmet Demir', 'Zeynep Çelik', 'Mustafa Şahin', 'Elif Aydın', 'Can Öztürk', 'Deniz Arslan'];

const SUBJECT_LABELS: Record<ReportSubjectType, string[]> = {
  listing: [
    'Deniz manzaralı 3+1 daire',
    'Yatırımlık imarlı arsa',
    'Merkezi konumda kiralık dükkan',
    'Site içi bahçeli villa',
    'Devremülk tatil hissesi',
  ],
  user: ['İstanbul Kaya Emlak', 'Mehmet Yılmaz (danışman)', 'Ankara Demir Emlak', 'Zeynep Çelik', 'Ege Arslan Emlak'],
  message: [
    'İlan hakkında mesaj dizisi',
    'Fiyat pazarlığı görüşmesi',
    'Randevu talebi mesajı',
    'Ödeme talebi içeren mesaj',
    'İletişim bilgisi paylaşımı',
  ],
};

/** Contextual complaint text per reason category. */
const DESCRIPTIONS: Record<ReasonCategory, string> = {
  spam: 'Aynı içerik defalarca tekrar paylaşılıyor ve alakasız bağlantılar içeriyor.',
  fraud: 'Kapora talebi ve gerçek dışı fiyatlarla dolandırıcılık şüphesi var.',
  inappropriate: 'İçerik hakaret ve uygunsuz ifadeler barındırıyor.',
  misinformation: 'İlan bilgileri (metrekare/konum) gerçeği yansıtmıyor.',
  other: 'Kurallara aykırı olabilecek şüpheli bir durum bildiriliyor.',
};

function seed(): Report[] {
  const rows: Report[] = [];
  for (let i = 0; i < 30; i += 1) {
    const subjectType = REPORT_SUBJECT_TYPES[i % REPORT_SUBJECT_TYPES.length]!;
    const reasonCategory = REASON_CATEGORIES[i % REASON_CATEGORIES.length]!;
    // Skew fresh complaints toward "open" so the queue has work to do.
    const status = REPORT_STATUSES[i % 4 === 0 ? (i % REPORT_STATUSES.length) : 0]!;
    const priority = REPORT_PRIORITIES[i % REPORT_PRIORITIES.length]!;
    const labels = SUBJECT_LABELS[subjectType];
    const subjectLabel = labels[i % labels.length]!;

    rows.push({
      id: `R-${3000 + i}`,
      subjectType,
      subjectId: `${subjectType === 'listing' ? 'L' : subjectType === 'user' ? 'U' : 'M'}-${1000 + i}`,
      subjectLabel,
      reasonCategory,
      description: DESCRIPTIONS[reasonCategory],
      status,
      priority,
      reporterName: REPORTERS[i % REPORTERS.length]!,
      createdAt: new Date(2026, 6, 1 + (i % 24), 8 + (i % 12), (i * 7) % 60).toISOString(),
    });
  }
  return rows;
}

let db: Report[] = seed();

/** Reset the mock DB (tests). */
export function resetReportsDb() {
  db = seed();
}

/** Current snapshot of the mock DB (read-only). */
export function getReportsSnapshot(): Report[] {
  return [...db];
}

function applyQuery(url: URL): Paginated<Report> {
  const page = Number(url.searchParams.get('page') ?? '1');
  const pageSize = Number(url.searchParams.get('pageSize') ?? '25');
  const q = url.searchParams.get('q')?.toLocaleLowerCase('tr') ?? '';
  const statuses = url.searchParams.getAll('status');
  const subjectTypes = url.searchParams.getAll('subjectType');
  const reasonCategories = url.searchParams.getAll('reasonCategory');
  const priorities = url.searchParams.getAll('priority');
  const sortRaw = url.searchParams.get('sort');

  let items = db.filter((r) => {
    if (
      q &&
      !r.subjectLabel.toLocaleLowerCase('tr').includes(q) &&
      !r.description.toLocaleLowerCase('tr').includes(q) &&
      !r.reporterName.toLocaleLowerCase('tr').includes(q)
    )
      return false;
    if (statuses.length && !statuses.includes(r.status)) return false;
    if (subjectTypes.length && !subjectTypes.includes(r.subjectType)) return false;
    if (reasonCategories.length && !reasonCategories.includes(r.reasonCategory)) return false;
    if (priorities.length && !priorities.includes(r.priority)) return false;
    return true;
  });

  if (sortRaw) {
    const [field, dir] = sortRaw.split(',')[0]!.split(':');
    items = [...items].sort((a, b) => {
      const av = a[field as keyof Report] as string;
      const bv = b[field as keyof Report] as string;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return dir === 'desc' ? -cmp : cmp;
    });
  }

  const total = items.length;
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total, page, pageSize };
}

export const reportsHandlers = [
  http.get(`${API_BASE_URL}/reports`, ({ request }) => HttpResponse.json(applyQuery(new URL(request.url)))),

  http.get(`${API_BASE_URL}/reports/:id`, ({ params }) => {
    const report = db.find((r) => r.id === params.id);
    return report ? HttpResponse.json(report) : new HttpResponse(null, { status: 404 });
  }),

  http.post(`${API_BASE_URL}/reports/:id/action`, async ({ params, request }) => {
    const idx = db.findIndex((r) => r.id === params.id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const parsed = reportActionSchema.safeParse(await request.json());
    if (!parsed.success) {
      return HttpResponse.json({ error: parsed.error.issues[0]?.message ?? 'Geçersiz istek' }, { status: 422 });
    }
    const input: ReportActionInput = parsed.data;
    const before = db[idx]!;
    const after: Report = { ...before, status: REPORT_ACTION_STATUS[input.action] };
    db[idx] = after;
    writeAudit({
      actor: 'user:current',
      action: `report.${input.action}`,
      resource: `report:${before.id}`,
      before: { status: before.status },
      after: { status: after.status, reason: input.reason },
    });
    return HttpResponse.json(after);
  }),
];
