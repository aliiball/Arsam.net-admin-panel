# Task 006 — Aşama 2: Harita & Dataviz Katmanı

## Objective
P1 veri-görselleştirme + coğrafi katmanı ekle: token-stilli `MapView` (React Leaflet +
leaflet.markercluster) ve grafik araç setini genişlet (durum dağılımı donut + opsiyonel
moderasyon-akışı line). Haritayı ilan detayına, yeni grafikleri dashboard'a entegre et.
`docs/DESIGN_SYSTEM.md` chart tokenları + `dataviz` skill rehberine uy.

## Ön koşul / bağımlılık
- Kilitli stack'te listelenen ama henüz KURULMAMIŞ paketler: `react-leaflet`, `leaflet`,
  `leaflet.markercluster`, `@types/leaflet`, `@types/leaflet.markercluster`. Adım 1'de kur.
- Taksonomi'de koordinat yok → örnek il/ilçe için yaklaşık centroid koordinatları eklenecek
  (marker jitter ile ilan-seviyesi konum). Yaklaşık/mock olduğu PROGRESS'e not düşülecek.

## Steps
1. **Kurulum:** `react-leaflet leaflet leaflet.markercluster` + dev `@types/leaflet
   @types/leaflet.markercluster`. Leaflet CSS'i (+ markercluster CSS) uygulamaya dahil et
   (main.tsx veya MapView içinde import). Marker ikonu asset yolu düzeltmesi (Leaflet'in
   default icon bug'ı) uygulanacak.
2. **Koordinat verisi:** `features/listings/data/taxonomy.ts`'e (veya yeni `geo.ts`) örnek
   il/ilçe centroidleri + `listingLatLng(listing)` yardımcı (deterministik küçük jitter).
3. **`components/data/MapView`:** token-stilli, SSR/clientsafe (yalnızca client render), responsive,
   marker + **markercluster** kümeleme. Props: `markers: {id,lat,lng,label,popup?}[]`, `center?`,
   `zoom?`, `height?`, `onMarkerClick?`. **A11y:** haritanın erişilebilir alternatifi (SR için
   marker listesi / `aria-label`), klavye desteği, 44px hedefler. Renkler token'lardan (marker/cluster).
4. **Dataviz genişletme:** `DonutChartCard` deseni (recharts `PieChart`/`Cell`, chart-1..5 tokenları,
   merkez toplamı) — durum dağılımı için. (Opsiyonel: `LineChartCard` — moderasyon akışı; gerekirse
   `/dashboard/stats`'a küçük 7-günlük time-series ekle.) Mevcut `ChartCard`'ı temel al.
5. **Entegrasyon:**
   - `ListingDetailPage`: konum kartına tek-marker `MapView` (ilanın il/ilçe konumu).
   - `DashboardPage`: `byStatus` donut grafiği (+ opsiyonel akış line'ı) ekle.
   - (Stretch/opsiyonel) İlanlar listesine harita görünümü toggle'ı — zaman kalırsa; kalmazsa
     PROGRESS'e "ertelendi" notu.
6. **Stories + testler:** `MapView`, `DonutChartCard` (+ varsa `LineChartCard`) için tam-DoD stories
   (Default/Loading/Empty/Error/Mobile + `play` + a11y). Harita için render + marker/erişilebilir-liste
   assertion'ı. Güncellenen `ListingDetailPage`/`DashboardPage` story'leri hâlâ yeşil.

## Acceptance criteria
- [ ] MapView token-stilli, marker + clustering çalışır, responsive, mobilde düzgün.
- [ ] MapView a11y: erişilebilir alternatif + klavye + aria; a11y-addon temiz.
- [ ] Donut (byStatus) dashboard'da; ilan detayında tek-marker harita.
- [ ] Renkler yalnızca chart/semantik tokenlardan; hardcoded renk yok.
- [ ] Tüm bileşenlerde tam story seti + play; strict TS; `any`/`@ts-ignore` yok.
- [ ] Verify green (lint + typecheck + test + build) + build-storybook.
- [ ] DoD öz denetimi PASS → PROGRESS checkpoint → **007 görev dosyasını yaz** → CURRENT'ı ilerlet → DUR.

## Riskler / notlar
- Leaflet gerçek DOM/boyut ister; Storybook browser (Chromium) testinde çalışır ama jsdom unit'te değil
  → MapView mantık testleri gerekiyorsa yardımcıları (koordinat/jitter) saf fonksiyon olarak ayır.
- Leaflet default marker ikon asset'i Vite'ta kırılır; import ile düzeltme uygulanacak.
- Koordinatlar mock/yaklaşık — gerçek backend gelince değişecek (PROGRESS'e not).
- Harita a11y sınırlı; erişilebilir marker listesi zorunlu (color/harita tek sinyal olmasın).
