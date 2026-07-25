# Task 025 — Edge nav dock (kenar dock, referans esinli)

## Objective
Referans dock'un "kenardan açılan" nav'ını KENDİ tokenlarımızla entegre et: üç kenarda (alt/sol/sağ) kenardan
sarkan, **kalp atışı gibi nabız atan** cam tutamak; hover/focus/tap ile **ikon dizili nav dock'una açılır**. Sadece
`dock` layout modunda (masaüstü VE mobil). NİHAİ: macOS büyüteç dock'u — kapalı nabızlı hint, açılınca magnify. Golden Rule 1: birebir klon yok — kendi `--glass*`/motion tokenlarımız.

## Locked kararlar (kullanıcı onayı)
- İçerik **üç kenarda da AYNI** (tek `EdgeDock` bileşeni, `edge` parametresiyle 3 kez; tek nav kaynağı).
- **Üç kenar da** yapılır (alt yatay, sol/sağ dikey).
- Yeni yüzey → **feature-flag'li** (`edgeDock`), canlı aç/kapa; flag OFF → hiç render edilmez.
- Üstteki komut dock'una DOKUNULMAZ (o iş bitti).

## Kapsam
- `EdgeDock` bileşeni (`edge: 'bottom'|'left'|'right'`):
  - Kapalı: kenardan sarkan cam **tutamak** (grip) + `animate-pulse-soft` nabız (sadece kapalıyken; açılınca durur).
  - Açık: `usePrimaryNav(5)` izinli modül ikonları (ikon + tooltip etiket) + sonda **⌘K "tümü"** düğmesi
    (`CommandCardLauncher`'ı açar). Aktif route vurgulu (`isNavItemActive`).
  - Açılma: hover + **focus (klavye)** + **tap**; kapanma: mouse-leave (focus içeride değilse) / **Esc** / blur.
  - Yön: alt = yatay ray; sol/sağ = dikey ray. Konum `fixed`, kenara yaslı, panel içeri doğru açılır.
- Tokenlar: `bg-glass text-glass-foreground border-glass-border backdrop-blur-md`; açılma token'lı geçiş; nabız
  `pulse-soft`; `prefers-reduced-motion` hepsini kapatır (`motion-reduce:animate-none` + base-layer).
- A11y: `aria-expanded`/`aria-controls`, 44px hedefler, ikon `aria-hidden` + erişilebilir isim etiketten, focus yönetimi.
- Kapsam: masaüstü VE mobil (dock modu). Dock modunda MobileBottomNav gizli — gezinme yüzen pill + kenar dock + ⌘K (AppShell effectiveMode!=='dock').
- `feature-flags.ts`: `edgeDock` anahtarı (label+help) → settings ekranı otomatik alır. Default ON (katalog tutarlılığı).
- `DockShell`'e 3 `EdgeDock` (flag-gated).

## Steps
1. `edgeDock` feature flag.
2. `EdgeDock` bileşeni (3 yön, collapse/expand, a11y, tokenlar, nabız).
3. `DockShell` entegrasyonu (masaüstü+mobil, per-edge flag-gated, 3 kenar).
4. Stories: EdgeDock (bottom/left/right, collapsed/expanded, reduced-motion-bağımsız play: aria-expanded toggle +
   nav link render + active state); DockShell/AppShell dock story regresyon.
5. Agent'lar: token-guardian + a11y-sentinel + ux-critic + dod-reviewer; blocking'leri kapat.
6. Tam doğrulama: lint · typecheck · test · build · build-storybook yeşil.

## Acceptance criteria
- [x] 3 kenarda (alt/sol/sağ) kenar dock'u; kapalı tutamak nabız atar, açılınca ikon nav rayı gösterir.
- [x] Dock modu (masaüstü+mobil); per-edge flag (edgeDockBottom/Left/Right) OFF → ilgili kenar render yok.
- [x] Aynı nav (usePrimaryNav) üç kenarda; ⌘K "tümü" launcher'ı açar; aktif route vurgulu.
- [x] Klavye + dokunma + hover ile açılır/kapanır; `aria-expanded`, 44px, focus yönetimi; reduced-motion güvenli.
- [x] Token-only (glass/motion); Golden Rule 1 (klon yok).
- [x] lint · typecheck · test · build · build-storybook yeşil.
- [x] 4 agent çalıştırıldı; blocking kapandı; PROGRESS checkpoint → CURRENT ilerlet → DUR → commit.
