# Task 019 — Aşama 6: Breakpoint Adopsiyonu + Responsive Re-audit

## Objective
Projeye **8-token'lı, isimlendirilmiş breakpoint ölçeği** getir ve mevcut responsive davranışı bu ölçeğe
göre yeniden dengele — **strateji A**: 1024px'deki tablo/kabuk convergence'ını (masaüstü tablo ↔ mobil kart,
sidebar/topnav ↔ drawer+bottom-nav) DEĞİŞTİRMEDEN koru. Bu, sonraki fazların (020 mobil, 021 dock, 022 motion)
tutarlı bir kırılım-noktası sözlüğü üzerinde çalışmasını sağlar.

Tailwind v4 CSS-first `@theme` kullanıyoruz; şu an breakpoint token'ı TANIMLI DEĞİL (Tailwind default'ları:
sm640/md768/lg1024/xl1280/2xl1536). Yeni ölçek `lg`'yi 768'e çekeceği için, 1024 semantiğini taşıyan
`lg:` kullanımları **anlam-koruyucu** biçimde `xl:`'e taşınmalı.

## Yeni breakpoint ölçeği (`@theme` içinde `src/styles/theme.css`)
```
--breakpoint-xs:  320px   (küçük telefon)
--breakpoint-sm:  480px   (telefon)
--breakpoint-md:  640px   (büyük telefon / küçük tablet)
--breakpoint-lg:  768px   (tablet portre)
--breakpoint-xl:  1024px  (tablet yatay / küçük dizüstü)  ← ESKİ `lg` eşiği burada
--breakpoint-2xl: 1280px  (dizüstü)
--breakpoint-3xl: 1536px  (masaüstü)
--breakpoint-4xl: 1920px  (geniş masaüstü)
```
Not: Tailwind v4'te `@theme`'e `--breakpoint-*` eklemek varsayılan ölçeği **değiştirir** (xs/3xl/4xl ekler,
sm/md/lg/xl/2xl değerlerini override eder). Bu yüzden remap ZORUNLU — aksi halde `lg:`(artık 768) shell/tablo
switch'ini 1024'ten 768'e kaydırır (regresyon).

## Strateji A — anlam-koruyucu remap
`grep -rn 'lg:' src --include='*.tsx'` → **22 kullanım / 10 dosya** (görev anında yeniden say). İki sınıf:

**Sınıf 1 — shell/tablo switch (1024 semantiği; `lg:` → `xl:` ZORUNLU):** ~13 kullanım
- `src/components/shell/SidebarShell.tsx` (satır ~27 `lg:flex`, ~60 `lg:pb-6`)
- `src/components/shell/TopnavShell.tsx` (~20 `lg:flex`, ~32 `lg:pb-6`)
- `src/components/shell/MobileNav.tsx` (~25 `lg:hidden`, ~56 `lg:hidden`)
- `src/components/shell/TopbarActions.tsx` (~24 `lg:inline`, ~25 `lg:inline`)
- `src/components/ai/AssistantDock.tsx` (~31 `lg:bottom-6`)
- `src/components/data-table/DataTable.tsx` (~185 `lg:flex-row/items/justify`, ~217 `lg:block` [masaüstü tablo],
  ~342 `lg:hidden` [kart listesi]) — tablo↔kart switch'in KALBİ; 1024'te kalmalı.

**Sınıf 2 — içerik grid yoğunluğu (yargı gerektirir, otomatik `xl:` DEĞİL):** ~9 kullanım
- `src/features/dashboard/pages/DashboardPage.tsx` (~57 `lg:grid-cols-4`, ~64/~134 `lg:grid-cols-3`)
- `src/features/reports/pages/ReportsPage.tsx` (~70 `lg:grid-cols-3 xl:grid-cols-6`, ~80 `lg:grid-cols-2`, ~119 `lg:grid-cols-3`)
- Karar: bunlar shell switch'i DEĞİL, salt içerik reflow'u. Yeni ölçekte `lg`(768)'de daha erken çok-kolon
  almak tablet için genelde İYİLEŞTİRME. VARSAYILAN: `lg:` bırak (768'de reflow), AMA her birini gözden geçir —
  eğer bir grid 768'de sıkışıyorsa `xl:`'e al. Reports'taki mevcut `lg:...xl:...` zinciri yeni ölçekte
  768/1024 kademesine denk gelir; kasıtlı olduğunu doğrula.

Remap tek tek, anlamı okunarak yapılır (kör bul-değiştir DEĞİL). Her dosyada `data-testid="topnav"` / sidebar /
bottom-nav / tablo-vs-kart görünürlüğünü 1023px ve 1024px'te doğrula.

## Storybook viewport'ları
- `.storybook/preview` viewport listesini yeni ölçeğe hizala: **320 / 480 / 768** (+ mevcut 360/414 kalabilir).
- Shell + DataTable + bir feature list story'sinde 768 (tablet) ve 1024 (masaüstü) viewport'larını ekleyip
  convergence'ın doğru eşikte olduğunu göz/asserion ile doğrula.

## Steps
1. `@theme`'e 8 `--breakpoint-*` token'ı ekle (`src/styles/theme.css`).
2. Sınıf 1'in ~13 `lg:`'sini `xl:`'e remap et (shell + data-table); her birini 1023/1024 sınırında doğrula.
3. Sınıf 2'nin ~9 grid `lg:`'sini gözden geçir; sıkışanları `xl:`'e al, gerisini gerekçeyle bırak.
4. Storybook viewport'larını 320/480/768'e hizala; shell/table story'lerine tablet+desktop viewport ekle.
5. **a11y-sentinel + ux-design-critic** agent'larını çalıştır (018'de kuruldu) — yeni ölçekte responsive
   davranışı ve 018 smoke-run'ın işaret ettiği mobil ergonomi bulgularını doğrula.
6. Tam doğrulama: lint · typecheck · test · build + build-storybook. TÜM story/test yeşil kalmalı.

## Acceptance criteria
- [ ] `@theme`'de 8 `--breakpoint-*` token tanımlı (xs320…4xl1920).
- [ ] Shell (sidebar/topnav/mobile) ve DataTable convergence'ı **hâlâ 1024px'te** switch ediyor (regresyon yok);
      sınıf-1 `lg:`'ler `xl:` oldu.
- [ ] Sınıf-2 grid'leri bilinçli bırakıldı/remap edildi (her biri için tek satır gerekçe PROGRESS'te).
- [ ] Storybook viewport'ları 320/480/768; shell/table story'leri tablet+desktop viewport'unda doğru.
- [ ] lint · typecheck · test · build · build-storybook yeşil.
- [ ] `dod-reviewer` + a11y-sentinel + ux-design-critic çalıştırıldı; blocking bulgular kapatıldı.
- [ ] PROGRESS checkpoint → CURRENT güncelle → **020 görev dosyasını yaz** → DUR → kullanıcı commit → `/clear`.

## Riskler / notlar
- **En büyük risk:** `@theme --breakpoint-*` eklemek Tailwind default ölçeğini override eder → remap yapılmazsa
  shell/tablo switch'i sessizce 768'e kayar. Adım 1 ve 2 AYNI commit'te, aralarında build+göz doğrulaması.
- 018 agent bulguları (bu faz `src/` değiştirmediği için ertelenmişti) 019/020'nin girdisidir: a11y-sentinel'in
  44px/aria bulguları çoğunlukla **020 (mobil UX)** kapsamı; 019 yalnızca kırılım-noktası remap'ine odaklan,
  ama re-audit sırasında ucuz a11y düzeltmeleri denk gelirse al.
- Bu faz `src/styles/theme.css` + ~10 component dosyası + `.storybook` dokunur — Golden Rule 2 (token-only)
  korunur; design-token-guardian temiz raporlamalı.
