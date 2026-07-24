# Task 008 — Kategoriler & Nitelikler

## Objective
Emlak taksonomisini (kategoriler) ve her kategoriye bağlı **dinamik nitelik setlerini** yönetilebilir hâle
getir. Bugün bu taksonomi `features/listings/data/taxonomy.ts`'te SABİT kod olarak duruyor ve ilan
formunu (create wizard'ın "dinamik nitelikler" adımı) besliyor. Bu görev, o taksonomiyi bir **yönetim
modülü** (list/detail/edit) hâline getirir: kategoriler + her kategorinin nitelik alanları (tip, zorunluluk,
seçenekler) CRUD ile düzenlenir; ilan formu bu tek kaynaktan beslenmeye devam eder.

## Şablon (listings/users dikeylerinden)
- Şema kaynağı-hakikat: `features/categories/schemas/*` (Zod → `type` infer).
- MSW: merkezi registry'ye ekle; yazma işlemleri `lib/audit`'e immutable kayıt yazsın
  (`category.create|update|reorder|archive`, `attribute.create|update|delete`).
- Hooks: `useCategories`, `useCategory`, `useUpsertCategory` / `useReorderCategories` /
  `useUpsertAttribute` (optimistic + rollback + sonner toast).
- Sayfalar: List (kategori tablosu/kartları + sıralama), Detail/Edit (kategori meta + nitelik seti editörü).
- Nav: `config/nav-schema.ts`'te `categories` ZATEN var (`/categories`, permission `category.manage`).
- Permissions: rota + aksiyonlar `<Can permission="category.manage">` + route `permission` meta ile gated.

## Steps
1. **Şemalar** (`features/categories/schemas`):
   - `attributeFieldSchema`: id, key (form alan anahtarı), label, type: 'number'|'text'|'select'|'boolean',
     required: boolean, unit?: string (m², yıl…), options?: {value,label}[] (select için), order: number.
   - `categorySchema`: id, key (mevcut `konut|isyeri|arsa|devremulk|turistik` ile uyumlu), label, description,
     icon?: string, order, status: 'active'|'archived', attributes: attributeFieldSchema[].
   - `categoryFormSchema` (RHF/zod; sayısal alanlar string→submit boundary parse — listings deseni),
     `attributeFormSchema`.
   - Saf yardımcılar: `sortByOrder`, `nextOrder`, `validateAttributeKeyUnique` (unit-testable).
2. **Örnek veri + MSW** (`features/categories/data` + `api/handlers`): mevcut `CATEGORY_ATTRIBUTES` +
   `CATEGORY_LABELS` + HEATING/DEED/ZONING enum'larını **tohum veriye dönüştür** (5 kategori, her biri
   nitelik seti ile). Handlers: list, detail, upsert category, reorder (order patch), upsert/delete attribute.
   Her yazma → `lib/audit`. Registry'ye kaydet. NOT: `getCategoriesSnapshot()` sağla (ilan formu ileride
   buradan beslenebilsin diye köprü — bu görevde en azından read tarafını hazırla).
3. **Hooks** (`features/categories/api`): queries + mutations (optimistic reorder dâhil).
4. **Bileşenler** (`features/categories/components`): `CategoryStatusBadge`, `AttributeTypeBadge`,
   `AttributeEditor` (bir kategorinin nitelik listesini ekle/düzenle/sil + sürükle-sırala VEYA yukarı/aşağı
   ok ile order; select tipinde options editörü), `CategoryFormDialog` (kategori meta düzenle). FieldHelp:
   her form alanı zorunlu (attribute key/label/type/options).
5. **Sayfalar** (`features/categories/pages`): List (kategori tablosu: label, key, nitelik sayısı, durum,
   order; reorder + archive + "Yeni kategori"), Detail/Edit (`/categories/:id` — kategori meta + AttributeEditor).
6. **Nav + rotalar + permissions**: `categories` route'unu PlaceholderPage'den gerçek sayfalara çevir
   (`router.tsx`); `:id` detay rotası + routeMeta; `<Can>` gating.
7. **Stories + testler**: tüm yeni bileşenler için tam-DoD stories (Default/Loading/Empty/Error/Mobile +
   play + a11y). Sayfa story'leri seeded-QueryClient + memory-router harness (`page-story-utils` desenini
   yeniden kullan). Unit: `sortByOrder`/`nextOrder`/`validateAttributeKeyUnique` + handlers'ın audit yazdığını
   ve reorder'ın order'ı güncellediğini kanıtla.

## Acceptance criteria
- [ ] Categories list/detail/edit uçtan uca MSW'ye karşı çalışır; kategori + nitelik seti CRUD.
- [ ] Nitelik editörü: tip/zorunluluk/seçenek düzenlenebilir; reorder çalışır; her yazma `lib/audit`'e düşer.
- [ ] Taksonomi tek kaynak: seed, listings'in mevcut `CATEGORY_ATTRIBUTES`/labels'ından türetilir; read köprüsü
      (`getCategoriesSnapshot`) hazır (ilan formunu KIRMADAN — mevcut sabit taksonomi çalışmaya devam edebilir
      ya da köprüye bağlanır; regresyon yok).
- [ ] Nav HER İKİ modda `categories`'i gösterir; rota + aksiyonlar `category.manage` ile gated.
- [ ] Tüm bileşenlerde tam story seti + play; strict TS; `any`/`@ts-ignore` yok; token-only; renk tek sinyal değil.
- [ ] Verify green (lint + typecheck + test + build) + build-storybook.
- [ ] DoD öz denetimi (`dod-reviewer`) PASS → PROGRESS checkpoint → **009 görev dosyasını yaz** →
      CURRENT'ı ilerlet → DUR → kullanıcı commit → `/clear`.

## Riskler / notlar
- **Regresyon riski:** ilan create wizard'ı bugün `CATEGORY_ATTRIBUTES`'a bağlı. Bu görevde ya (a) taksonomiyi
  yeni modüle taşıyıp listings'i köprüden besle, ya da (b) yeni modülü paralel kur + read köprüsünü hazırla,
  listings'i BOZMA. (b) daha güvenli — wizard'ın gerçek bağlanması ayrı/opsiyonel adım.
- Reorder'ı basit tut: yukarı/aşağı ok yeterli; DnD (dnd-kit) opsiyonel stretch.
- Select nitelik options editörü mini bir list-editor — FieldHelp + zorunlu label/value.
- Saf order/validasyon yardımcılarını UI'dan ayır (unit-test).
- `page-story-utils` / audit / DataTable / FormField'ı yeniden kullan — kopyalama değil paylaşım.
