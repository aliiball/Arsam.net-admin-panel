# Task 015 — Ayarlar / Config (Settings)

## Objective
`/settings` (nav'da `settings.manage` iznyle ZATEN var, bugün PlaceholderPage) modülünü gerçek bir
**sistem ayarları + feature-flag + layout-defaults** yüzeyi yap. Amaç: kullanıcı/sistem düzeyinde
yapılandırmayı düzenlenebilir (MSW arkalı) hale getirmek, her değişikliği `lib/audit`'e **yazmak**
(013'ün `AuditTimeline`'ını yeniden kullan) ve mevcut `LayoutConfig`/tema/density mekanizmasıyla
tutarlı kalmak. RBAC (014) desenini örnek al: schema → MSW handlers (oku/yaz + audit) → hooks →
form/panel bileşenleri → sayfa → route → stories + testler.

## Şablon / yeniden kullanım
- Yazma-dikeyi ritmi: 011/014'ü guardrail/audit/optimistic deseni için örnek al. Bu bir "tablo dikeyi"
  DEĞİL — sekmeli/kartlı bir **ayarlar formu** (RBAC'in matris editörü gibi özel bir yüzey).
- **Mevcut model:** `src/config/layout.ts` (`LayoutConfig`, `DEFAULT_LAYOUT`, `loadLayout/saveLayout`,
  `LAYOUT_STORAGE_KEY`) + `src/lib/layout/layout-context.tsx` (`useLayout`, tema/density/mode, localStorage
  persist). Ayarlar sayfası bu layout tercihlerini bir yüzeyden düzenlemeli AMA çift-kaynak yaratma:
  layout tercihleri layout-context'in TEK kaynağı kalsın; Ayarlar sayfası onu okuyup `setMode/setTheme/
  setDensity/...` üzerinden yazsın (yeni bir store icat etme). "Layout defaults" = bu tercihlerin
  organizasyon/sistem varsayılanı (feature-flag/sistem ayarıyla aynı MSW modeli altında).
- **Feature flags + sistem ayarları:** yeni, MSW-arkalı bir `settings` kaynağı. RBAC'teki canlı-köprü
  gereksinimi kadar ağır DEĞİL — basit bir `GET /settings` / `PATCH /settings` yeterli. İstersen
  feature-flag'leri okuyan küçük bir `useFeatureFlag(key)` / context köprüsü ekle (over-engineering yapma;
  en az bir flag'in UI'da gerçekten bir şeyi aç/kapattığını göster — örn. "AI kopilot rozetleri" ya da
  "haritayı ilan detayında göster" gibi zaten var olan bir davranışı flag'e bağla).

## Steps
1. **Şema/tip** (`features/settings/schemas`): Zod-first. En az üç grup:
   (a) **Genel/sistem** (`siteName`, `supportEmail`, `defaultLocale` [tr sabit olabilir], `maintenanceMode: boolean`);
   (b) **Feature flags** (anahtar→boolean set; `FEATURE_FLAGS` kataloğu — key + Türkçe etiket + açıklama, RBAC'in
   `PERMISSION_CATALOG`'una benzer yapı); (c) **Layout defaults** (mode/density/theme — `LayoutConfig`'i aynala,
   çift-tanım yapma: `config/layout.ts`'ten türet/yeniden-kullan). `settingsFormSchema` (numeric/enum/boolean
   alanlar; e-posta refine). Guardrail düşün: `maintenanceMode` açılırken onay (ConfirmDialog).
2. **MSW handlers** (`features/settings/api/handlers`): `GET /settings` → `{ general, flags, layoutDefaults }`;
   `PATCH /settings` (kısmi güncelle; `safeParse` → 422; her değişiklik `writeAudit({ action:
   'settings.update'|'flag.enable'|'flag.disable', resource: 'settings:<group>' | 'flag:<key>', before/after })`).
   Registry'ye kaydet (exact `/settings`; param-route yok). Seed = mantıklı varsayılanlar; `resetSettingsDb()`
   + `getSettingsSnapshot()`.
3. **Hooks** (`features/settings/api`): `useSettings()` + `useUpdateSettings()` (optimistic + rollback + sonner).
   Feature-flag köprüsü: en basit yol — `useFeatureFlag(key)` bir React context/store okusun ve bir yerde
   gerçekten bir davranışı aç/kapat (canlı yansısın; en az bir testle kanıtla — 014 canlı-köprü dersi).
4. **Bileşenler** (`features/settings/components`): `SettingsSection` (başlık + açıklama + form alanları sarmalı),
   `FeatureFlagList` (her flag: `Switch` [≥44px hit — 012/014 dersi] + etiket + `FieldHelp`/açıklama, aria),
   `GeneralSettingsForm` (RHF + `FormField`/FieldHelp her alanda), `LayoutDefaultsForm` (mode/density/theme
   seçimi — mevcut `LayoutSwitcher`/`ThemeToggle`/`DensityToggle` primitiflerini yeniden kullanmayı düşün).
   `maintenanceMode` togg'u ConfirmDialog ile korunsun.
5. **Sayfa** (`features/settings/pages/SettingsPage`): `Tabs` ile üç grup (Genel / Özellik Bayrakları / Görünüm
   Varsayılanları) + değişiklik audit paneli (`AuditTimeline`, `settings:*`/`flag:*` filtreli). Anlık (optimistic)
   ya da grup-bazlı "Kaydet" — en basit tutarlı UX'i seç, PROGRESS'e yaz (014 anlık-kayıt precedent'i var).
   `settings.manage` route-guard zaten var.
6. **Rota**: `/settings` PlaceholderPage → gerçek `SettingsPage`.
7. **Stories + testler**: `SettingsPage` + en az `FeatureFlagList`/`GeneralSettingsForm` için tam-DoD stories
   (Default/Loading/Empty/Error/Mobile + play + a11y). Page `Error` story `seedQueryError` ile GERÇEK isError.
   Unit: handler update + audit yazımı + validasyon 422 + (flag köprüsü) flag değişiminin gerçekten bir
   davranışı aç/kapattığı.

## Acceptance criteria
- [ ] `/settings` gerçek ayarlar yüzeyi; en az 3 grup (genel/sistem, feature flags, layout defaults) düzenlenebilir.
- [ ] Her değişiklik `lib/audit`'e yazılır ve sayfada `AuditTimeline` ile görünür.
- [ ] En az bir feature-flag UI'da gerçek bir davranışı canlı aç/kapatır (en az bir testle kanıtla).
- [ ] Layout defaults, mevcut `layout-context`/`config/layout.ts` TEK kaynağıyla tutarlı (çift-kaynak/çift-tanım yok).
- [ ] `maintenanceMode` gibi kritik toggle bir ConfirmDialog ile korunur.
- [ ] Tam story seti + play; page `Error` story gerçek `isError`; strict TS; `any`/`@ts-ignore` yok; touch
      target ≥44px (flag switch'leri!); help/info için `title` YOK; token-only.
- [ ] Verify green (lint + typecheck + test + build) + build-storybook.
- [ ] DoD öz denetimi (`dod-reviewer`) PASS → PROGRESS checkpoint → **016 görev dosyasını yaz** →
      CURRENT'ı ilerlet → DUR → kullanıcı commit → `/clear`.

## Riskler / notlar
- **Çift-kaynak riski:** layout tercihleri zaten `layout-context`'te ve localStorage'da. Ayarlar sayfası bunları
  YÖNETMELI ama ikinci bir doğruluk kaynağı yaratmamalı. "Layout defaults" = organizasyon varsayılanı (MSW'de
  saklanan), kullanıcının anlık layout tercihi = layout-context (localStorage). İkisinin ilişkisini net tut ve
  PROGRESS'e yaz (örn. "defaults yalnızca ilk-yükleme/`reset`'te uygulanır" gibi bir kural seç, over-engineering yapma).
- **Feature-flag köprüsü:** RBAC'in canlı matris köprüsüyle aynı desen ama daha hafif. Bir flag'i gerçek bir
  davranışa bağla (yeni davranış icat etmektense zaten var olan birini flag'e al) ki "canlı yansıma" kanıtlanabilir olsun.
- **Kapsam:** çok sayıda ayar eklemeye çalışma; 3 temsili grup + 3-5 flag yeterli. Kapsam büyürse ertele + PROGRESS'e not düş.
- **a11y & touch target:** flag switch'leri ≥44px hit (paylaşılan `Switch` <44px sistemik açığı — 012/014 dersi;
  hücre/satır sarmalıyla 44px sağla). Renk tek sinyal değil (Switch + etiket + aria).
- **maintenanceMode guardrail:** yanlışlıkla siteyi kapatmayı önle — ConfirmDialog + net uyarı metni.
