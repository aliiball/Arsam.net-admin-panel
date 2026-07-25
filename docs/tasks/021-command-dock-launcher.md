# Task 021 — Aşama 6: Floating Command Dock + Launcher

## Objective
Üçüncü bir layout modu ekle: **`dock`**. `sidebar`/`topnav`'a ek olarak, komut-güdümlü, "chrome-light" bir
navigasyon: kalıcı yan/üst menü YOK (sidebar gizli/opsiyonel); bunun yerine ekranın üst-ortasında yüzen bir
**command dock** (Arsam launcher + context pill + notification center) ve ⌘K ile açılan **card-grid launcher**.
Referans (sahibinden-v2) yalnızca ETKİLEŞİM/DÜZEN fikri için; görsel dil TAMAMEN bizim OKLCH token'larımız +
**zengin cam** (measured transparency/blur, WCAG-kontrast güvenli) — cream palet / beyaz liquid-glass / font
trio KLONLANMAZ. Yeni yüzey **feature-flag'li** (canlı aç/kapa, geri alınabilir).

## Locked kararlar (BACKLOG Aşama 6)
- 3. layout modu `dock`; `LayoutProvider`/`layout-context` zaten `mode` + persistence taşıyor (000/001) — `dock`'u
  bir mode değeri olarak ekle; `LayoutSwitcher`'a üçüncü seçenek.
- Zengin cam = kendi token'larımızla ölçülü şeffaflık/blur; her yüzey WCAG AA kontrast geçmeli (arka planı ne
  olursa olsun metin/ikon okunur). Hardcoded renk YOK — cam efekti token + `backdrop-blur` utility'leriyle.
- Mobilde `dock` de drawer + bottom-nav + ⌘K'ya yakınsar (Golden Rule 3) — mevcut `MobileDrawer`/`MobileBottomNav`
  yeniden kullanılır; dock chrome telefonda command bar'a düşer.
- Feature-flag: 015'te kurulan canlı feature-flag köprüsünü kullan (Ayarlar/Config). `dock` modu + notification
  center flag ile aç/kapa; kapalıyken mevcut sidebar/topnav davranışı hiç değişmez.

## Kapsam

### A. `dock` layout modu (AppShell)
- `LayoutMode`'a `'dock'` ekle (`config/layout` + `layout-context`); `AppShell` `mode==='dock'` için yeni bir
  `DockShell` render etsin (sidebar/topnav render etme). İçerik alanı tam genişlik; üstte yüzen dock.
- `LayoutSwitcher`'a "Dock" seçeneği (ikon + label); persistence (localStorage `arsam.layout`) otomatik.
- Tek nav şeması (`config/nav-schema.ts`) DEĞİŞMEZ — dock da aynı şemadan beslenir (Golden Rule 8).

### B. Floating command dock (top-center pill)
- Üst-ortada yüzen, zengin-cam bir bar. İçerik:
  - **Arsam launcher** düğmesi (brand + "Menü/Ara" → ⌘K launcher'ı açar).
  - **Context pill**: "Şu an: <aktif sayfa>" (`handle.routeMeta`/breadcrumb'dan türet) + canlı saat (mevcut bir
    saat yoksa küçük bir `useNow` hook; deterministik test için enjekte edilebilir).
  - **Notification center**: bell + badge; sayaç moderation kuyruğu (pending) + son audit'ten türetilir (yeni
    endpoint gerektirmez — mevcut `getListingsSnapshot`/audit'ten oku ya da hafif bir `useNotifications` hook).
    Tıklayınca bir Popover/Sheet: son N bildirim + ilgili sayfaya derin link.
- 44px dokunma hedefleri; klavye erişilebilir; `data-action`/`data-entity` (AI-first).

### C. Card-grid launcher (⌘K genişletme)
- Mevcut `CommandPalette` (001) → dock modunda **card-grid launcher**'a genişlet: izinli her modül bir kart
  (ikon + label + kısa açıklama), nested quick-actions, ve en üstte **NL kutusu** (parser `lib/ai` HAZIR — 016).
  NL kutusu "onaylamadan uygulama yok" guardrail'ini korur (öneri → onay).
- `sidebar`/`topnav` modlarında CommandPalette mevcut haliyle çalışmaya devam eder (regresyon yok); card-grid
  yalnızca dock modunda (ya da flag ile) devreye girer — ortak bir `CommandLauncher` bileşenine refactor et.
- İzin filtreleme: `usePermittedNav`/`filterNavByRole` yeniden kullan.

### D. Zengin cam token'ları
- `theme.css`'e cam yüzeyler için semantic token(lar) ekle (örn. `--surface-glass` / uygun `bg-*/backdrop-*`
  eşlemesi) — DESIGN_SYSTEM.md'ye kaydet. Light+dark ikisinde de kontrast doğrula (a11y-sentinel + token-guardian).
- Cam yalnızca dock chrome + notification/launcher yüzeylerinde; içerik kartlarında değil.

### E. Feature-flag entegrasyonu
- 015 config/flag köprüsü: `dock`-modu ve notification-center flag'leri. Kapalıyken kod-yolu ölü olmasın ama
  görünmesin; açık/kapa canlı (reload'suz).

## Steps
1. `LayoutMode` + `layout-context` + `LayoutSwitcher`'a `dock`; persistence.
2. `DockShell` + floating dock (launcher btn + context pill + saat + notification bell/badge/popover).
3. `CommandPalette` → ortak `CommandLauncher` refactor; dock'ta card-grid + NL kutusu + nested quick-actions.
4. `useNotifications` (moderation pending + audit türevi) + `useNow` (enjekte edilebilir saat).
5. Zengin-cam token(lar) `theme.css` + DESIGN_SYSTEM.md; WCAG kontrast.
6. Feature-flag köprüsü (015) ile `dock` + notification aç/kapa.
7. Mobil yakınsama: dock telefonda command bar + mevcut drawer/bottom-nav.
8. Stories: `DockShell`/dock (sidebar+topnav+dock mode story'leri), `CommandLauncher` card-grid + NL play,
   notification popover, context pill; `bpXs`/`bpSm`/`bpLg`/`bpXl` viewport'ları; deterministik saat (enjekte).
9. Agent'lar: `design-token-guardian` (cam token-only + kontrast), `a11y-sentinel` (44px/aria/focus/cam kontrast),
   `ux-design-critic` (dock ergonomi + cam okunabilirlik), `dod-reviewer`. Blocking'leri kapat.
10. Tam doğrulama: lint · typecheck · test · build · build-storybook — hepsi yeşil.

## Acceptance criteria
- [ ] `dock` üçüncü bir çalışır layout modu: sidebar/topnav gizli, üst-ortada yüzen command dock; runtime switch
      + persistence; tek nav şemasından beslenir.
- [ ] Dock: Arsam launcher + context pill ("Şu an: <sayfa>" + saat) + notification center (bell+badge+popover,
      moderation/audit'ten türetilmiş sayı, derin link).
- [ ] ⌘K launcher dock'ta card-grid (izinli modül kartları + nested quick-actions + NL kutusu, onaydan önce
      uygulama yok); sidebar/topnav'da mevcut CommandPalette regresyonsuz çalışır.
- [ ] Zengin cam yüzeyler kendi OKLCH token'larımızla; light+dark WCAG AA kontrast; hardcoded renk yok.
- [ ] Feature-flag ile `dock` + notification canlı aç/kapa; kapalıyken sidebar/topnav hiç etkilenmez.
- [ ] Mobilde dock drawer + bottom-nav + ⌘K'ya yakınsar; 44px hedefler; klavye + aria temiz.
- [ ] `bpXs/bpSm/bpLg/bpXl` viewport story'leri + play; deterministik saat (enjekte edilmiş).
- [ ] lint · typecheck · test · build · build-storybook yeşil.
- [ ] `dod-reviewer` + `a11y-sentinel` + `ux-design-critic` + `design-token-guardian` çalıştırıldı; blocking kapandı.
- [ ] PROGRESS checkpoint → CURRENT güncelle → **022 görev dosyasını yaz** → DUR → kullanıcı commit → `/clear`.

## Riskler / notlar
- **Cam + kontrast** en büyük risk: şeffaf/blur bir yüzeyde metin, altındaki içeriğe göre kontrastı kaybedebilir.
  Token'lı yarı-opak bir taban katmanı (yeterli opaklık) + blur; a11y-sentinel'e cam yüzeyleri özellikle denetlet.
- CommandPalette refactor'ı sidebar/topnav'ı BOZMAMALI — ortak `CommandLauncher`, mod'a göre sunum; mevcut ⌘K
  testleri yeşil kalmalı.
- Saat/now → `Date.now()` testlerde non-deterministik; `useNow` enjekte edilebilir olsun (story/test sabit saat verir).
- Notification sayısı YENİ endpoint gerektirmesin — mevcut moderation/audit verisinden türet (MSW handler eklenirse
  bile mevcut mock DB'den okusun).
- Bu faz YENİ yüzey ekler ama mevcut modları feature-flag ardında korur; token-only + AI-first + Storybook-first
  + FieldHelp (launcher'daki NL kutusu için yardım) kuralları aynen geçerli.
- 020 tracked item'ları burada DEĞİL: AiSuggestionBadge tap-reasons + KpiCard delta rengi 022'de; FilterBar
  mobil toolbar ayrı follow-up.
