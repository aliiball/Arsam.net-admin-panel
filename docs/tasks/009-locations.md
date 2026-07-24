# Task 009 — Lokasyonlar (il / ilçe / mahalle)

## Objective
Coğrafi taksonomiyi (il → ilçe → mahalle) yönetilebilir bir **modül** hâline getir. Bugün bu hiyerarşi
`features/listings/data/taxonomy.ts`'teki SABİT `LOCATIONS` objesinde duruyor ve hem ilan formunun cascading
lokasyon adımını hem de filtre/şehir facet'lerini besliyor. Bu görev, kategoriler modülünün (008) desenini
alarak lokasyonları list/detail/edit ile CRUD edilebilir yapar; ilan formu + filtreler bu tek kaynaktan
beslenmeye devam eder (regresyon yok).

## Şablon (008 categories dikeyinden — birebir yeniden kullan)
- Şema kaynağı-hakikat: `features/locations/schemas/*` (Zod → `type` infer).
- MSW: merkezi registry'ye ekle; yazma işlemleri `lib/audit`'e immutable kayıt yazsın
  (`location.create|update|archive|reorder` — il/ilçe/mahalle için tek aksiyon ailesi, `level` alanıyla ayrış).
- Hooks: `useProvinces` (il listesi), `useProvince` (ilçe/mahalle ile birlikte detay), `useUpsertProvince` /
  `useUpsertDistrict` / `useUpsertNeighborhood` / `useReorder*` (optimistic + rollback + sonner toast).
- Sayfalar: List (il tablosu: plaka, ad, ilçe sayısı, durum), Detail/Edit (`/locations/:il` — il meta + ilçe
  ağacı; ilçe seçilince mahalle editörü). Cascading yönetim = 008'in `AttributeEditor`'ının hiyerarşik hâli.
- Nav: `config/nav-schema.ts`'te `locations` ZATEN var (`/locations`, permission `location.manage`).
- Permissions: rota + aksiyonlar `<Can permission="location.manage">` + route `permission` meta ile gated.

## Steps
1. **Şemalar** (`features/locations/schemas`):
   - `neighborhoodSchema`: id, name, order.
   - `districtSchema`: id, key (ör. `kadikoy`), label, order, status, neighborhoods: neighborhoodSchema[].
   - `provinceSchema`: id, code (plaka, ör. `34`), label, order, status: 'active'|'archived',
     districts: districtSchema[].
   - Form şemaları: `provinceFormSchema` (code 2-haneli plaka regex, label, status),
     `districtFormSchema` (key slug + label + status), `neighborhoodFormSchema` (name).
   - Saf yardımcılar: `sortByOrder`/`nextOrder`'ı 008'ten paylaş (kopyalama değil — ortak bir `lib` ya da
     `features/categories/schemas`'tan re-export; en temizi küçük bir `lib/order.ts`'e taşımak), +
     `validateCodeUnique` / `validateKeyUnique`.
2. **Örnek veri + MSW** (`features/locations/data` + `api/handlers`): mevcut `LOCATIONS`'tan **tohum türet**
   (3 il, ilçeler, mahalleler). Handlers: province list (filter status + code/label ara), province detail,
   upsert province, upsert/delete district, upsert/delete neighborhood, reorder (her seviye). Her yazma →
   `lib/audit`. Registry'ye kaydet. `getLocationsSnapshot()` read köprüsü (ilan formu + filtreler ileride
   buradan beslensin — bu görevde read tarafını hazırla, listings'i KIRMA).
3. **Hooks** (`features/locations/api`): queries + mutations (optimistic reorder dâhil). DataTable `meta` prop'u
   (008'de eklendi) ile satır-içi reorder.
4. **Bileşenler** (`features/locations/components`): `LocationStatusBadge`, `LocationTree` (il→ilçe→mahalle
   hiyerarşik editör; ekle/düzenle/sil + yukarı/aşağı reorder; 008 `AttributeEditor` desenini genişlet),
   `ProvinceFormDialog` / `DistrictFormDialog` / `NeighborhoodFormDialog` (FieldHelp zorunlu her alanda),
   `provinceColumns`.
5. **Sayfalar** (`features/locations/pages`): List (il tablosu + reorder + arşivle + "Yeni il"), Detail/Edit
   (`/locations/:id` — il meta + `LocationTree`).
6. **Nav + rotalar + permissions**: `locations` route'unu PlaceholderPage'den gerçek sayfalara çevir
   (`router.tsx`); `:id` detay rotası + routeMeta; `<Can>` gating.
7. **Stories + testler**: tüm yeni bileşenler için tam-DoD stories (Default/Loading/Empty/Error/Mobile +
   play + a11y). Sayfa story'leri seeded-QueryClient + memory-router harness (`page-story-utils` desenini
   yeniden kullan). Unit: saf yardımcılar + handlers'ın audit yazdığını ve her seviyede reorder'ın order'ı
   güncellediğini kanıtla.

## Acceptance criteria
- [ ] Locations list/detail/edit uçtan uca MSW'ye karşı çalışır; il + ilçe + mahalle CRUD.
- [ ] Hiyerarşik editör: ekle/düzenle/sil + reorder her seviyede çalışır; her yazma `lib/audit`'e düşer.
- [ ] Taksonomi tek kaynak: seed, listings'in mevcut `LOCATIONS`'ından türetilir; read köprüsü
      (`getLocationsSnapshot`) hazır; ilan formu + filtreler KIRILMAZ (regresyon yok).
- [ ] Nav HER İKİ modda `locations`'ı gösterir; rota + aksiyonlar `location.manage` ile gated.
- [ ] Tüm bileşenlerde tam story seti + play; strict TS; `any`/`@ts-ignore` yok; token-only; renk tek sinyal değil;
      touch target ≥44px; help/info için `title` YOK (008 DoD derslerini uygula baştan).
- [ ] Row-selection kullanılıyorsa gerçek bir bulk action bağlı (008'deki dead-affordance hatasını tekrarlama).
- [ ] Verify green (lint + typecheck + test + build) + build-storybook.
- [ ] DoD öz denetimi (`dod-reviewer`) PASS → PROGRESS checkpoint → **010 görev dosyasını yaz** →
      CURRENT'ı ilerlet → DUR → kullanıcı commit → `/clear`.

## Riskler / notlar
- **Regresyon riski (yüksek):** `LOCATIONS` + `ilOptions/ilceOptions/mahalleOptions` bugün listings'te 6+ yerde
  import ediliyor (form, filtreler, columns, users). Bu görevde (b) stratejisini uygula: yeni modülü paralel kur,
  read köprüsünü hazırla, `taxonomy.ts`'i BOZMA. Gerçek bağlama ayrı/opsiyonel adım.
- 008'in DoD derslerini baştan uygula: `size="icon"` override etme (44px koru), `title` kullanma, row-selection
  varsa bulk action bağla, `page-story-utils`/audit/DataTable(`meta`)/FormField'ı yeniden kullan.
- `sortByOrder`/`nextOrder` iki modülde de gerekiyor — küçük bir paylaşılan `lib/order.ts`'e taşımayı değerlendir
  (kopya-yapıştır değil paylaşım).
- Hiyerarşi 3 seviye; `LocationTree`'yi 008 `AttributeEditor`'dan türet ama seviyeleri genelleştir (il/ilçe/mahalle).
