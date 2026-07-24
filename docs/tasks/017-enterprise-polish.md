# Task 017 — Aşama 5: Enterprise Cila & Performans

## Objective
Panel fonksiyonel olarak tamam (dikeyler + AI-first katman bitti). Bu FİNAL faz, biriken çapraz-kesen
teknik borcu kapatır ve ürünü "enterprise" seviyesine çeker: **route-level code-split** ile bundle
küçültme, **mobile-first ince ayar**, **WCAG kontrast + a11y** sistematik denetimi, ve ertelenmiş
**DataTable kolon pinning + drag-reorder**. Yeni dikey YOK — mevcut her şeyi cilala, ölç, kanıtla.

## Biriken borç (PROGRESS'ten toplanan — bunları kapat)
1. **Bundle boyutu ~2.0MB** (recharts + leaflet + markercluster). Route-level `lazy()` + `Suspense`
   ile ana bundle'ı böl; `MapView`, `ReportsPage` (recharts), Leaflet detay kartı prime lazy adayları.
2. **DataTable kolon pinning + drag-reorder** (004'te ertelendi; state hook'ları hazır, DnD/pin UI yok).
3. **Paylaşılan touch-target < 44px:** `Switch`/`Checkbox` primitifleri sistematik olarak 44px altında
   (tüm dikeylerde tekrar eden not). Bir kez primitif seviyesinde düzelt.
4. **`ChartCard` erişilebilir özet + `ErrorState` retry 44px** (012 notu): `ChartCard`'a opsiyonel
   `sr-only` özet, `ErrorState` retry butonu 44px hedefine.
5. **`DataTableProps<TData, TMeta>` generic** (008 notu): `meta` için double-cast sınırını kaldır.
6. **OSM tile mock + configurable tile provider** (006 notu): stories/testlerde tile'lar canlı çekiliyor.
7. **Page `Error` story retrofit** (listings/users/categories/locations hâlâ Empty'yi mirror'lıyor —
   `seedQueryError` ile gerçek `isError`'a çevir; 010'dan beri yeni dikeyler doğru).
8. **FieldHelp `aria-describedby` popover→field** (RBAC 014 notu, `docs/FORMS_UX.md` follow-up).

## Steps (öneri sıra — ölçerek ilerle)
1. **Route-level code-split:** `router.tsx`'te ağır sayfaları `lazy()` + `Suspense` fallback (skeleton)
   ile sar. Ölç: `npm run build` öncesi/sonrası ana chunk boyutunu PROGRESS'e yaz. Lazy sınırında
   RouteGuard + routeMeta davranışının bozulmadığını doğrula.
2. **Touch-target primitifleri:** `Switch`/`Checkbox` (+ varsa diğerleri) ≥44px hit alanı (görsel boyut
   korunur, hit alanı pseudo-element ile büyür — `FieldHelp` HIT_AREA deseni). Regresyon: mevcut story'ler.
3. **DataTable kolon pinning + drag-reorder:** TanStack pinning state + sürükle-bırak kolon sırası;
   klavye erişilebilir alternatif (kolon menüsünden "sabitle"/"sola taşı"). Sticky pinned kolon stilleri
   token-only. En az bir liste sayfasında (listings) canlı; DATA_TABLE_SPEC point 4'ü tamamla.
4. **a11y & kontrast denetimi:** `@storybook/addon-a11y` raporunu topla (varsa CI'a bağla); WCAG kontrast
   ihlallerini token seviyesinde düzelt. `ChartCard` sr-only özet + `ErrorState` retry 44px.
5. **`DataTableProps` generic + page-error retrofit + FieldHelp aria-describedby** (küçük borç kalemleri).
6. **Mobile-first ince ayar:** her ana sayfayı 360/414px'te gözden geçir; taşma/overlap/scroll sorunları.

## Acceptance criteria
- [ ] Route-level `lazy()` code-split: ana bundle belirgin küçüldü (öncesi/sonrası ölçüm PROGRESS'te);
      Suspense fallback skeleton; RouteGuard/routeMeta/breadcrumb bozulmadı.
- [ ] `Switch`/`Checkbox` (+ tespit edilen diğer interaktifler) ≥44px hit target; görsel boyut korunmuş.
- [ ] DataTable kolon pinning + drag-reorder en az listings'te çalışır + klavye-erişilebilir alternatif;
      DATA_TABLE_SPEC point 4 tam.
- [ ] `ChartCard` opsiyonel erişilebilir özet + `ErrorState` retry ≥44px; a11y-addon raporu temiz(e yakın,
      kalanlar PROGRESS'te gerekçeli).
- [ ] Ertelenen borç kalemleri (generic `DataTableProps`, page-error retrofit, FieldHelp aria-describedby)
      kapatıldı VEYA gerekçeyle bir sonraki mini-göreve devredildi.
- [ ] Verify green (lint + typecheck + test + build) + build-storybook; DoD öz denetimi (`dod-reviewer`) PASS.
- [ ] PROGRESS checkpoint → CURRENT güncelle (faz bitti / proje tamam) → DUR → kullanıcı commit.

## Riskler / notlar
- **Kapsam patlaması:** bu FİNAL cila fazı; "her şeyi mükemmelleştir" değil, LİSTELENEN borcu kapat. Ölç,
  düzelt, kanıtla. Bir kalem beklenenden büyürse böl ve PROGRESS'e devret — yeşili bozma.
- **Lazy + test:** `lazy()` sınırları Storybook page-story harness'ini bozabilir (sayfalar doğrudan import
  ediliyor, router üzerinden değil) — story'ler etkilenmez ama router smoke'u elle doğrula.
- **Kolon pinning sticky:** yatay scroll + sticky pinned kolon + virtualization etkileşimi dikkat; token-only
  gölge/kenarlık, hardcoded renk yok.
- **Determinizm:** tile mock eklerken de `Date.now()`/argless `new Date()` yok; deterministik fixtures.
