# Task 014 — RBAC (Roller & İzinler)

## Objective
`/rbac` (nav'da `rbac.manage` iznyle ZATEN var, bugün PlaceholderPage) modülünü **rol/izin matrisi editörü**
yap: rolleri ve her rolün `resource.action` izinlerini bir matris üzerinden görüntüle + düzenle. Bugün izin
modeli `src/lib/permissions/permissions.ts` içinde SABİT bir `matrix: PermissionMatrix` — bu görev onu
**çalışma zamanında düzenlenebilir** (MSW arkalı) hale getirir, tüm izin değişikliklerini `lib/audit`'e
**yazar** (013'ün AuditTimeline'ını yeniden kullan) ve `docs/PERMISSIONS.md`'yi senkron tutar.

## Şablon / yeniden kullanım
- Bu bir "tablo dikeyi" DEĞİL — özel bir **matris editörü** (`PermissionMatrixEditor`). Yine de yazma-dikeyi
  ritmini izle: schema (Zod) → MSW handlers (oku/yaz + audit) → hooks → editör bileşeni → sayfa → route →
  stories + testler. 011/012'yi guardrail/audit deseni için örnek al.
- Mevcut model: `src/lib/permissions/permissions.ts` (`Role`, `Permission`, `PermissionMatrix`, `matrix`,
  `can`, `ROLES`, `ROLE_LABELS`). `permission-context.tsx` `can/Can/usePermission`'ı sağlar; nav + RouteGuard
  bunu kullanır. **Kritik:** editör matrisi değiştirdiğinde `Can`/RouteGuard/nav'ın bunu görmesi gerekir —
  ya `SessionProvider`/context'i MSW'den beslenen matrise bağla ya da matris değişimini yayınlayan bir
  store ekle. En küçük, en az invaziv yolu seç; `matrix` sabitini TEK kaynak olarak koru (seed).
- Audit: her izin ekleme/çıkarma ya da rol değişikliği `writeAudit({ action: 'rbac.grant'|'rbac.revoke'|
  'role.update', resource: 'role:<role>', before/after, reason? })`. Detay/geçmiş için `AuditTimeline`
  (`@/features/audit`) kullan.
- `super-admin` = `'*'` DEĞİŞTİRİLEMEZ (guardrail): her zaman tüm izinlere sahip; editörde read-only göster,
  düşürülmesine izin verme (kendini kilitleme koruması).

## Steps
1. **Şema/tip** (`features/rbac/schemas`): mevcut `Permission`/`Role`/`PermissionMatrix`'i aynala/genişlet.
   Tüm bilinen izinleri kaynak-bazlı grupla: `PERMISSION_CATALOG` (resource → action[] + Türkçe etiketler).
   `permissionToggleSchema` (role + permission + granted), `roleFormSchema` (yeni özel rol: id/label/
   açıklama — opsiyonel, kapsamı küçük tut). `super-admin` guardrail'ini şemada/handler'da zorla.
2. **MSW handlers** (`features/rbac/api/handlers`): `GET /rbac/matrix` → `{ roles, permissions(catalog),
   matrix }`; `POST /rbac/matrix/toggle` (role+permission+granted → 422 eğer super-admin düşürülmeye
   çalışılırsa; audit `rbac.grant`/`rbac.revoke`). Registry'ye kaydet (`/rbac` öneki tek; param-route yok).
   Seed = `permissions.ts`'teki `matrix` (tek kaynak). Runtime state'i modül içinde tut (`resetRbacDb()`).
3. **Hooks** (`features/rbac/api`): `useRbacMatrix()` + `useTogglePermission()` (optimistic + rollback +
   sonner). Matris değişince `Can`/nav/RouteGuard'ın güncellenmesi için context/store köprüsünü kur.
4. **Bileşen** (`features/rbac/components/PermissionMatrixEditor`): roller × izinler (kaynak-gruplu satırlar)
   grid'i; hücrede `Checkbox`/`Switch` (≥44px hit — 012 dersi); `super-admin` sütunu read-only "*" rozeti;
   kaynak grupları `Accordion`/başlıkla toplanabilir; her satırda izin adı + `FieldHelp`/tooltip (title YOK).
   a11y: gerçek tablo semantiği (`<table>`/`role="grid"`), sütun/satır başlıkları, sr-only durum.
5. **Sayfa** (`features/rbac/pages/RbacPage`): başlık + `PermissionMatrixEditor` + değişiklik audit paneli
   (`AuditTimeline`, `getAuditFor('role:*')` veya rol filtreli). Değişiklikler anında kaydedilir (optimistic)
   ya da "Kaydet" ile toplu — en basit tutarlı UX'i seç, PROGRESS'e yaz. `rbac.manage` route-guard zaten var.
6. **Rota**: `/rbac` PlaceholderPage → gerçek `RbacPage`.
7. **`docs/PERMISSIONS.md` senkron**: matris/katalog değişirse dokümanı güncelle (kaynak-of-truth uyumu).
8. **Stories + testler**: `PermissionMatrixEditor` + `RbacPage` için tam-DoD stories (Default/Loading/Empty/
   Error/Mobile + play + a11y). Page `Error` story `seedQueryError` ile GERÇEK isError. Unit: handler
   toggle + audit yazımı + super-admin guardrail 422; matris→context köprüsünün `can()` sonucunu değiştirdiği.

## Acceptance criteria
- [ ] `/rbac` gerçek matris editörü; izinler kaynak-bazlı gruplu; hücre toggle çalışır; değişiklik `lib/audit`'e
      yazılır ve sayfada `AuditTimeline` ile görünür.
- [ ] `super-admin` guardrail: `'*'` düşürülemez (UI read-only + server 422); kendini-kilitleme yok.
- [ ] Matris değişikliği `Can`/nav/RouteGuard'a yansır (canlı; en az bir testle kanıtla).
- [ ] `docs/PERMISSIONS.md` matris/katalogla senkron.
- [ ] Tam story seti + play; page `Error` story gerçek `isError`; strict TS; `any`/`@ts-ignore` yok; touch
      target ≥44px (matris hücreleri!); help/info için `title` YOK.
- [ ] Verify green (lint + typecheck + test + build) + build-storybook.
- [ ] DoD öz denetimi (`dod-reviewer`) PASS → PROGRESS checkpoint → **015 görev dosyasını yaz** →
      CURRENT'ı ilerlet → DUR → kullanıcı commit → `/clear`.

## Riskler / notlar
- **Yazma dikeyi + canlı model:** 013 salt-okunurdu; bu görev izin MODELİNİ değiştirir. En büyük risk
  `matrix` sabitini runtime state ile köprülemek. Sabiti seed olarak koru; runtime kopyayı MSW/store'da tut;
  `can()`/context runtime kopyayı okusun. Global mutable state → testlerde `resetRbacDb()` ile izole et.
- **Kendini kilitleme:** super-admin `'*'` guardrail'i ZORUNLU; ayrıca aktif kullanıcının kendi rolünden
  `rbac.manage`'i çekmesini engellemeyi düşün (opsiyonel, over-engineering yapma — en azından super-admin koru).
- **Kapsam:** özel rol OLUŞTURMA opsiyonel ve küçük tutulmalı; asıl hedef mevcut 5 rolün izin matrisini
  düzenlemek. Özel rol ekleme kapsamı büyürse ertele ve PROGRESS'e not düş.
- **a11y:** matris büyük bir grid — gerçek tablo semantiği, satır/sütun başlıkları, hücre `aria-label`
  ("<rol> için <izin>: açık/kapalı"); renk tek sinyal değil.
- **Touch target:** matris hücrelerindeki toggle'lar ≥44px olmalı (paylaşılan `Checkbox`/`Switch` <44px
  sistemik açığı — 012/011 dersi; burada hücre sarmalıyla 44px hedefi sağla).
