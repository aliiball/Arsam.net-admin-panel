# Task 024 — Dock pulse (referans "kalp atışı" etkisi, sadece dock modu)

## Objective
Referans projedeki komut dock'unun "yaşayan" launcher hissini (kalp atışı gibi büyüyüp küçülen) KENDİ
tokenlarımızla, ölçülü şekilde entegre et — YALNIZCA `dock` layout modunda. Golden Rule 1: birebir klon YOK
(palet/glass/font alınmaz); sadece etkileşim fikri. `prefers-reduced-motion` MUTLAK kapatır.

## Kapsam
- `theme.css`: `pulse-soft` keyframe (0/100% scale(1), 50% scale(1.06) — reduced-motion tek-cycle'da kalıntı
  transform bırakmaz) + `--animate-pulse-soft` token (`--ease-in-out` yeni simetrik ease, ~2.6s infinite).
- `DockLogo` bileşeni: pulse'lı yuvarlak Arsam launcher logosu (`animate-pulse-soft` + `motion-reduce:animate-none`,
  `aria-hidden`). `CommandDock` (masaüstü, size-7) + `DockShell` (mobil pill, size-8) inline hexagon badge'lerini
  bununla değiştir. Pulse YAPISAL olarak dock-only (bu bileşenler yalnızca dock modunda render edilir).
- **023 devri:** `CommandCardLauncher` yaprak (leaf, çocuksuz) modül kartlarını `Card interactive` + stretched-link
  (`after:inset-0`) grameriyle hizala; parent (çocuklu, çok-aksiyonlu) kartlar renk-only hover'da kalır.

## Steps
1. `theme.css` pulse tokenları.
2. `DockLogo` + CommandDock/DockShell entegrasyonu (Hexagon import temizliği).
3. CommandCardLauncher leaf/parent affordance ayrımı.
4. Stories: `DockLogo` (pulse class + reduced-motion + aria-hidden guard), CommandCardLauncher leaf/parent play.
5. Agent'lar: token-guardian + a11y-sentinel + ux-critic + dod-reviewer; blocking'leri kapat.
6. Tam doğrulama: lint · typecheck · test · build · build-storybook yeşil.

## Acceptance criteria
- [x] `pulse-soft` token-güdümlü, reduced-motion'da kapanır (kalıntı transform yok).
- [x] DockLogo pulse yalnızca dock chrome'da (CommandDock + DockShell); aria-hidden.
- [x] CommandCardLauncher leaf kartlar `Card interactive` + stretched-link; parent kartlar renk-only (belgelendi).
- [x] Stories + motion-bağımsız play guard'ları (pulse class, leaf/parent affordance).
- [x] lint · typecheck · test · build · build-storybook yeşil.
- [x] 4 agent çalıştırıldı; blocking kapandı; PROGRESS checkpoint → CURRENT ilerlet → DUR → commit.

## Not
- Tailwind v4 `docs/` taramasını `@source not "../../docs"` ile kapattık (task markdown'larındaki `@[...]` örnekleri
  CSS build'ini kırıyordu). Task 025 rapor HTML'i kendi stilini taşıyacak.
