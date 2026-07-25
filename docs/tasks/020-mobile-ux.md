# Task 020 — Aşama 6: Mobil UX Düzeltmeleri

## Objective
019'da kurulan 8-token'lı breakpoint ölçeğini (xs320/sm480/md640/lg768/xl1024/2xl1280/3xl1536/4xl1920)
KULLANARAK mobil/telefon ergonomisini bir üst seviyeye çıkar. 019 yalnızca eşikleri korudu (kaymayı önledi);
020 artık gerçek mobil düzeltmeleri yapar. Ayrıca 018 a11y smoke-run + 019 re-audit'in **tracked** bıraktığı
dokunma-hedefi / aria bulgularını kapatır. Yeni `xs`(320)/`sm`(480) token'ları ilk kez burada aktif kullanılır.

## Kapsam (BACKLOG 020 + tracked bulgular)

### A. `renderMobileCard` her list'e (ANA İŞ)
Şu an HİÇBİR list page `renderMobileCard` geçmiyor → hepsi `DataTable`'ın generic `dl/dt/dd` fallback'ini
kullanıyor (her kolonu bir satır olarak dökür — yoğun, önceliksiz, aksiyonsuz). 9 list page'e amaca uygun
mobil kart ver:
- `listings/ListingsListPage`, `users/UsersListPage`, `users/OfficesListPage`, `categories/CategoriesListPage`,
  `locations/LocationsListPage`, `messages/ReportsListPage`, `promotions/PaymentsListPage`,
  `promotions/PackagesListPage`, `audit/AuditListPage`.
- Her kart: birincil başlık + 1–2 anahtar meta + durum/badge + (varsa) satır aksiyonu; select checkbox'ı
  korunur (bulk çalışmaya devam etsin); detay linki `data-action="open-detail"`.
- Ortak bir `MobileListCard` helper'ı düşün (başlık/meta/badge/aksiyon slotları) — 9 kez tekrar etme.
- 44px dokunma hedefleri: kart tıklama alanı + checkbox + aksiyon butonları.

### B. Pagination wrap/kompakt (mobil)
`DataTablePagination` telefonda taşıyor. `xs`/`sm`'de: sayfa-boyut seçici + "önceki/sonraki" ikon-only kompakt
varyant; sayfa sayacı `x/y` formatına düşsün; `flex-wrap` + min-0. `DataTablePagination.tsx:37`
`md:flex-row` zaten var (019'da sm→md kaydı) — telefonda (`<640`) dikey yığılıyor; kompaktlığı gözden geçir.

### C. KPI `grid-cols-1` en küçük ekranda
Dashboard/Reports KPI satırları şu an `grid-cols-2` tabanlı (en küçük ekranda 2-up). `xs`(320)'de 2-up KpiCard
`text-2xl` değerlerini sıkıştırabilir. En küçük ekran için `grid-cols-1 sm:grid-cols-2 ...` düşün (320'de tek
kolon, 480+'ta 2-up). KpiCard değerine defensive `truncate`/responsive boyut de eklenebilir (ux-critic 019 notu).

### D. Dialog/Sheet mobil genişlik
Dialog'lar `max-w-[calc(100%-2rem)]` (veya token'lı eşdeğer) ile telefonda kenarlardan taşmasın. `dialog.tsx`
içerik max-width'ini mobilde gözden geçir; `sheet.tsx` `md:max-w-sm` (019'da sm→md) telefonda tam-genişlik.

### E. Karmaşık yüzeylerin mobil varyantı
- **RBAC matris editörü** (`features/rbac`): geniş matris telefonda yatay-scroll veya kart/accordion varyantı.
- **Reports Tabs**: sekme şeridi telefonda scroll veya select'e düşsün.

### F. Tracked a11y bulguları (018 smoke + 019 re-audit) — BLOCKER'ları kapat
- **FilterBar NL-box `aria-describedby`** (018 BLOCKER): doğal-dil kutusuna yardım/açıklama düğümü + binding.
- **Sub-44px dokunma hedefleri:** radio-group item'ları; `DataTable` resize/reorder handle'ları; pagination +
  bulk-bar `size-8` override'ları; FilterBar chip-remove (×) düğmeleri. Hepsini 44px'e çıkar (ikon buton
  `size="icon"` = size-11 zaten 44px; override'ları kaldır ya da hit-area ekle).
- **İki isimsiz DatePicker:** erişilebilir ad ver (`aria-label`).

## Steps
1. `MobileListCard` helper'ı (veya konvansiyon) + `DataTable`'a temiz entegrasyon; 9 list page'e `renderMobileCard`.
2. `DataTablePagination` mobil kompakt varyant (xs/sm).
3. KPI grid'leri `grid-cols-1 sm:grid-cols-2` (Dashboard + Reports); KpiCard defensive truncate.
4. Dialog/Sheet mobil genişlik düzeltmeleri.
5. RBAC matris + Reports Tabs mobil varyantları.
6. Tracked a11y BLOCKER'ları kapat (F).
7. Story: her dokunulan list page + pagination + dialog + rbac + reports'a `bpXs`(320)/`bpSm`(480) viewport
   story'leri; `renderMobileCard`'ı play ile doğrula (kart görünür, tablo columnheader `<xl` gizli).
8. Agent'lar: `a11y-sentinel` (44px/aria kapandı mı) + `ux-design-critic` (mobil ergonomi) + `dod-reviewer` +
   `design-token-guardian`. Blocking'leri kapat.
9. Tam doğrulama: lint · typecheck · test · build · build-storybook — hepsi yeşil.

## Acceptance criteria
- [ ] 9 list page'in tümü amaca uygun `renderMobileCard` kullanıyor (generic fallback kalmadı); select+bulk çalışır.
- [ ] Pagination telefonda taşmıyor (xs/sm kompakt); dialog/sheet telefonda kenardan taşmıyor.
- [ ] KPI en küçük ekranda 1-up; KpiCard değerleri kırpılmıyor/taşmıyor.
- [ ] RBAC matris + Reports Tabs'ın kullanılır bir mobil varyantı var.
- [ ] 018/019 tracked a11y BLOCKER'ları kapandı: FilterBar NL aria, tüm dokunma hedefleri ≥44px, DatePicker adları.
- [ ] Yeni `bpXs`/`bpSm` viewport story'leri; play testleri mobil kart/görünürlüğü doğruluyor.
- [ ] lint · typecheck · test · build · build-storybook yeşil.
- [ ] `dod-reviewer` + `a11y-sentinel` + `ux-design-critic` çalıştırıldı; blocking kapandı.
- [ ] PROGRESS checkpoint → CURRENT güncelle → **021 görev dosyasını yaz** → DUR → kullanıcı commit → `/clear`.

## Riskler / notlar
- `renderMobileCard` 9 kez → ortak helper ŞART, yoksa DRY ihlali + tutarsız kartlar. Bir kart tasarımını
  DESIGN_SYSTEM elevation/spacing token'larıyla sabitle, hepsine uygula.
- 44px override kaldırınca satır yükseklikleri artabilir (pagination/bulk); kompakt tut ama hit-area ≥44px
  (görsel küçük + pseudo-element hit-area tekniği — FieldHelp'te var, referans al).
- Bu faz `src/` genişçe dokunur ama YENİ yüzey/mod yok (o 021'de). Token-only korunur; design-token-guardian temiz.
- 019'un named viewport'ları (bpXs…bpXl) hazır — story eklemek ucuz.
