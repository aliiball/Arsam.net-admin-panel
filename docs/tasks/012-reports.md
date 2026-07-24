# Task 012 — Raporlar & Analitik

## Objective
`/reports` (nav'da `report.view` izniyle ZATEN var, bugün PlaceholderPage) modülünü **çok-grafikli, filtrelenebilir,
export'lanabilir analitik ekranı** yap. Bu görev yeni bir "yazma" dikeyi DEĞİL — mevcut mock DB'lerden (listings /
users / promotions-payments / messages-reports + `lib/audit`) **türetilmiş metrikler** okuyan bir READ-ONLY analitik
katmanı. Aşama 1'de kurulan `KpiCard`/`ChartCard` ve Aşama 2'deki `DonutChartCard` primitiflerini yeniden kullan;
eksik grafik varyantlarını (line/area + gruplu bar) ekle. AI-first: her kart `data-entity`/`data-action` taşısın.

## Şablon / yeniden kullanım
- Dashboard deseni: `features/dashboard/**` (KpiCard, ChartCard, DonutChartCard, `GET /api/dashboard/stats`,
  `useDashboardStats`) — birebir örnek al. Yeni modül `features/reports/**`.
- Metrik kaynağı: MSW handler'ları mevcut mock DB snapshot'larından hesaplar (`getListingsSnapshot`,
  `getUsersSnapshot` benzeri, `getPaymentsSnapshot`, `getReportsSnapshot`, `getAuditLog`). YENİ tohum verisi ekleme —
  var olanları türet. Gerekirse eksik `get*Snapshot` okuma köprüsünü ilgili feature'a ekle (yazma yok).
- Zaman serisi: tarih bucket'lama saf bir yardımcıda (`lib/analytics.ts` veya `features/reports/lib/*`) — UI'dan
  bağımsız, **unit-test** edilir (deterministik; `Date.now()` YOK, tarihleri veriden türet).
- Export: `lib/export.ts` (`exportCsv`/`exportXls`) yeniden kullan — her grafiğin altındaki veri tablosu export'lanır.

## Steps
1. **Şemalar/tipler** (`features/reports/schemas` veya `types.ts`): `reportsRange` (ör. `'7d'|'30d'|'90d'|'all'`),
   `metricPoint` (`{ date: string; value: number }`), `reportsOverview` (KPI'lar + seriler: ilan-trendi, gelir-trendi,
   moderasyon-hunisi, durum-kırılımları). Zod ile doğrula; `type` infer.
2. **MSW + saf metrik yardımcıları** (`features/reports/api/handlers` + `lib`): `GET /api/reports/overview?range=`
   endpoint'i snapshot'lardan hesaplar — (a) KPI'lar (toplam ilan, aktif ilan, toplam gelir [ödemeler − iadeler],
   iade oranı, bekleyen moderasyon, açık şikayet), (b) zaman serileri (ilan/gün, gelir/gün — `createdAt` bucket),
   (c) kategori/durum donut kırılımları, (d) moderasyon hunisi (pending→active/rejected). Saf `bucketByDay`/
   `sumBy`/`rateOf` yardımcıları unit-test'li. Registry'ye kaydet.
3. **Hooks** (`features/reports/api`): `useReportsOverview(range)` (queryKey range'e bağlı, keepPreviousData).
4. **Grafik primitifleri** (`components/data` altında eksikse): `LineChartCard` (recharts `LineChart`/`AreaChart`,
   chart-1..5 token'ları, ResponsiveContainer, empty/loading branch, a11y sr-only veri özeti). `ChartCard`'ı
   çok-serili gruplu bar destekleyecek şekilde genişlet (gerekiyorsa). Renk tek sinyal değil: legend label+value.
5. **Sayfa** (`features/reports/pages/ReportsPage`): range seçici (Tabs/SegmentedControl), KPI satırı (KpiCard'lar),
   2–3'lü grafik grid'i (ilan trendi line + gelir trendi area + moderasyon hunisi/donut kırılımları), her grafiğin
   "Dışa aktar" (CSV/XLS) aksiyonu. Mobile-first; `routeMeta` zaten var. `report.view` `<Can>` ile gate.
6. **Rota**: `/reports` PlaceholderPage → gerçek `ReportsPage` (`router.tsx`). Nav zaten `report.view` ile gösteriyor.
7. **Stories + testler**: tüm yeni grafik primitifleri + sayfa için tam-DoD stories (Default/Loading/Empty/Error/
   Mobile + play + a11y). Sayfa story'leri seeded-QueryClient + memory-router; **page `Error` story `seedQueryError`
   ile GERÇEK isError** (010/011 deseni). Unit: saf metrik yardımcıları (`bucketByDay` determinizmi, gelir = ödeme −
   iade, iade oranı, huni sayıları) + handler'ın overview zarfını döndürdüğü.

## Acceptance criteria
- [ ] `/reports` gerçek analitik sayfası; range seçici çalışır; KPI + en az 3 grafik (line/area + donut/bar) render eder.
- [ ] Tüm metrikler MEVCUT mock DB'lerden türetilir (yeni tohum yok); saf yardımcılar unit-test'li ve deterministik.
- [ ] Her grafiğin CSV/XLS export'u çalışır (`lib/export` yeniden kullanılır).
- [ ] Grafik primitifleri token-only; renk tek sinyal değil (legend label+value; sr-only veri özeti); ResponsiveContainer.
- [ ] Tam story seti + play; page `Error` story gerçek `isError`; strict TS; `any`/`@ts-ignore` yok; touch target ≥44px;
      help/info için `title` YOK.
- [ ] Verify green (lint + typecheck + test + build) + build-storybook.
- [ ] DoD öz denetimi (`dod-reviewer`) PASS → PROGRESS checkpoint → **013 görev dosyasını yaz** →
      CURRENT'ı ilerlet → DUR → kullanıcı commit → `/clear`.

## Riskler / notlar
- **Determinizm**: `Date.now()`/`new Date()` (argümansız) test/story'de kaçınılır — tarihleri snapshot verisinden
  türet; range filtresi "verinin en geç tarihine göre" göreli hesapla (sabit "bugün" enjekte edilebilir olsun).
- **Bundle**: recharts zaten dahil; yeni ağır bağımlılık ekleme. `MapView`/recharts route-level `lazy()` hâlâ Aşama 5.
- **Salt-okunur**: bu modül `lib/audit`'e YAZMAZ (analitik okuma); yalnızca `getAuditLog()` okuyabilir.
- **`report.view` izni**: finance + analyst + super-admin'de olmalı (matrisi kontrol et; analyst yoksa ekle ve
  `docs/PERMISSIONS.md`'i senkron tut) — analiz-odaklı rol raporları görebilmeli.
- **a11y**: grafik tek başına renkle anlam taşımasın — legend'da değer, ayrıca `sr-only` bir veri özeti/tablo sun.
