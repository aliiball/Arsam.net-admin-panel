# Task 013 — Denetim Kaydı (Audit Log)

## Objective
`/audit` (nav'da `audit.view` izniyle ZATEN var, bugün PlaceholderPage) modülünü **filtrelenebilir, deep-link'lenebilir
denetim tablosu + yeniden kullanılabilir `AuditTimeline` bileşeni** yap. Bu YENİ bir yazma dikeyi DEĞİL — mevcut
`lib/audit` kaydını (tüm verticaller zaten `appendAudit` ile yazıyor) okuyan bir READ-ONLY görünüm. Bugün pek çok detay
sayfası audit timeline'ını AD-HOC render ediyor; bu görev o deseni tek bir paylaşılan `AuditTimeline` bileşenine çıkarır
ve global bir denetim tablosu ekler.

## Şablon / yeniden kullanım
- Liste deseni: 011/012'deki DataTable + FilterBar + URL-state (`useTableUrlState`) — birebir örnek al. Sayfa
  `features/audit/pages/AuditListPage`.
- Salt-okuma köprüsü: `lib/audit` ZATEN `getAuditLog()` + `getAuditFor(resource)` sağlıyor. Yeni yazma YOK. Gerekirse
  `lib/audit`'e SADECE okuma tarafında yardımcılar ekle (ör. filtreli/sayfalı okuma) — imza koru.
- Timeline: mevcut vertical detay sayfalarındaki ad-hoc audit render'ını (`ListingDetailPage`, `UserDetailPage`,
  `CategoryDetailPage`, `ProvinceDetailPage`, `ReportDetailPage`, `PaymentDetailPage`) tek bir `AuditTimeline`
  bileşenine soyutla; en az BİR detay sayfasını yeni bileşene taşı (kanıt), gerisini opsiyonel bırakma — hepsini taşı
  ya da neden taşımadığını PROGRESS'e yaz.

## Steps
1. **Şema/tip** (`features/audit/schemas`): `auditEntry`'yi `lib/audit`'in mevcut tipinden türet/aynala (id, ts, actor
   [`ai:<agent>` destekli], action, resource, before/after, reason?). `auditQuery` facet'leri: action ailesi
   (listing.*/user.*/category.*/location.*/report.*/package.*/payment.* önekleri), actor türü (human vs `ai:*`),
   tarih aralığı, serbest metin (resource/reason araması).
2. **MSW handler** (`features/audit/api/handlers`): `GET /audit?page&pageSize&sort&filters` → `{ items, total, page,
   pageSize }` mevcut `getAuditLog()` üstünden filtreleme/sıralama/sayfalama. Registry'ye kaydet. (Salt-okuma; audit'e
   YAZMAZ.) Bu endpoint'in `/audit` önekiyle başka bir route ile ÇAKIŞMADIĞINI doğrula (012'deki `/reports/overview`
   vs `/reports/:id` dersini hatırla — handler sırası önemli).
3. **Hook** (`features/audit/api`): `useAuditLog(query)` (keepPreviousData) + gerekiyorsa `useAuditFor(resource)`.
4. **`AuditTimeline` bileşeni** (`components/data` veya `features/audit/components`): actor rozet (human/`ai:*` ayrımı —
   AI aksiyonları görsel olarak işaretli, renk TEK sinyal değil: ikon+etiket), action etiketi, before→after diff
   (durum/alan değişimi), reason, göreli+mutlak zaman. Boş/loading/mobil durumları. a11y: `<ol>` semantiği, sr-only
   zaman etiketleri.
5. **Sayfa** (`features/audit/pages/AuditListPage`): DataTable (kolonlar: ts, actor, action, resource, reason) +
   FilterBar (action-ailesi facet + actor-türü facet + tarih aralığı + NL/serbest metin) + export CSV/XLS. URL-state.
   `audit.view` route-level guard zaten var. Mobil kartlar.
6. **Rota**: `/audit` PlaceholderPage → gerçek `AuditListPage`. Nav zaten `audit.view` ile gösteriyor.
7. **Refactor**: ad-hoc timeline render'larını `AuditTimeline` ile değiştir (tekilleştir). Davranış eş, görsel tutarlı.
8. **Stories + testler**: `AuditTimeline` + `AuditListPage` için tam-DoD stories (Default/Loading/Empty/Error/Mobile +
   play + a11y). Page `Error` story `seedQueryError` ile GERÇEK isError (010/011/012 deseni). Unit: handler'ın
   filtre/sıralama/sayfalama + action-önek facet mantığı; actor `ai:*` ayrımı.

## Acceptance criteria
- [ ] `/audit` gerçek, filtrelenebilir denetim tablosu; action-ailesi + actor-türü + tarih + metin filtreleri çalışır;
      deep-link'lenebilir (URL-state); CSV/XLS export.
- [ ] `AuditTimeline` tek paylaşılan bileşen; en az bir (tercihen tüm) detay sayfası ad-hoc render yerine onu kullanır.
- [ ] AI aktörleri (`ai:<agent>`) insan aktörlerden görsel olarak ayrılır; renk tek sinyal değil (ikon+etiket+aria).
- [ ] Salt-okuma: modül `lib/audit`'e YAZMAZ; yalnızca okur. Yeni tohum verisi yok.
- [ ] Tam story seti + play; page `Error` story gerçek `isError`; strict TS; `any`/`@ts-ignore` yok; touch target
      ≥44px (özellikle FilterBar/Tabs/kart aksiyonları — 012 range-selector dersi); help/info için `title` YOK.
- [ ] Verify green (lint + typecheck + test + build) + build-storybook.
- [ ] DoD öz denetimi (`dod-reviewer`) PASS → PROGRESS checkpoint → **014 görev dosyasını yaz** →
      CURRENT'ı ilerlet → DUR → kullanıcı commit → `/clear`.

## Riskler / notlar
- **Salt-okuma**: 012 gibi, bu modül audit'e YAZMAZ. Testlerde `resetXDb()` çağıran diğer verticaller audit'i
  değiştirebilir; `getAuditLog()` global — test izolasyonu için filtre mantığını SAF bir yardımcıda tut ve sabit
  girdiyle unit-test et (handler entegrasyonunu ayrı, gevşek assert'lerle).
- **Çakışma**: `/audit` endpoint'i tek; yine de handler kayıt sırasını ve param route'larını kontrol et (012 dersi).
- **Tekilleştirme kapsamı**: `AuditTimeline`'a geçerken her detay sayfasının audit alanı biçimi (resource önekleri
  `listing:`/`user:`/`province:` vb.) farklı — bileşen `resource`'u ham gösterebilir ya da opsiyonel `renderResource`
  prop'u alabilir; over-engineering yapma, ham + opsiyonel formatlayıcı yeterli.
- **a11y**: AI vs human ayrımı sadece renkle değil — ikon (`Bot`/`User`) + metin etiketi + `aria-label`.
- **Determinizm**: göreli zaman ("2 saat önce") test/story'de kaçınılır ya da sabit "now" enjekte edilebilir olsun;
  mutlak `ts.slice(0,16)` her zaman göster.
