# Current Task
-> docs/tasks/022-motion-bento.md

Status: NOT STARTED (Aşama 6 — Modernizasyon; SON faz: Motion & Bento).
Tasks 000–021 (+ Aşama 1–5) complete — see PROGRESS.md. Task 021 kullanıcı commit'ini bekliyor.

Task 021 (Floating Command Dock + Launcher) done: 3. layout modu `dock` (feature-flag'li, `dockLayout` kapalıysa
`sidebar`'a düşer). Kalıcı sidebar/topnav YOK; üst-ortada **zengin-cam** `CommandDock` (Arsam launcher + `ContextPill`
["Şu an: üst › sayfa" mini-breadcrumb + enjekte edilebilir saat `useNow`] + `NotificationBell` + `UserMenu`).
`DockShell` mobilde **yüzen yuvarlak komut pill'i** (launcher + zil + UserMenu) + `MobileBottomNav`'a yakınsar (Golden Rule 3; tam nav card-grid launcher'dan, drawer yok). ⌘K → `CommandCardLauncher`
(izinli modül KARTLARI + nested quick-action chip'leri + modül arama + NL kutusu [FieldHelp, onaydan önce uygulama
yok; yazma → AI asistanı]); `CommandLauncher` mod'a göre `cards`/`list` seçer, sidebar/topnav'da eski `CommandPalette`
regresyonsuz. `features/notifications`: saf `deriveNotifications` (moderasyon özeti [badge=pending] + son audit derin
link) + `GET /notifications` MSW (mevcut mock DB'den, yeni kaynak yok). Cam token'ları `--glass*` (light+dark, 0.9
opaklık, WCAG-güvenli; sadece chrome). Bayraklar `dockLayout`+`notificationCenter` (015 köprüsü, canlı aç/kapa).
nav-schema'ya 10 modül `description`'ı. **4 agent çalıştı:** token-guardian CLEAN; a11y-sentinel 1 BLOCKER (44px,
düzeltildi) + 1 WARN (glass-border kontrastı, düzeltildi); ux-critic 2 High (dock UserMenu + ContextPill üst-nav,
düzeltildi) + orta/düşük (uygulandı); dod-reviewer NO→YES (flag-OFF + LayoutSwitcher story'leri + cast temizliği).
lint 0-error · typecheck · test 923/923 · build · build-storybook hepsi yeşil.

Mode: TASK (uygula → doğrula → DoD → PROGRESS checkpoint → sonraki görev dosyasını yaz → CURRENT ilerlet
→ DUR → kullanıcı commit → /clear).

Aşama 6 kilitli kararlar (BACKLOG.md'de detay):
- Referans (sahibinden-v2): SEÇİCİ uyarlama, birebir klon değil (cream palet / beyaz liquid-glass / font trio ALINMAZ).
- Motion: kendi `--duration-*`/`--ease-*` tokenlarımız; enterprise-sakin, `prefers-reduced-motion` MUTLAK korunur.
- Yeni yüzeyler token-only + AI-first + Storybook-first; play testleri animasyon süresine yaslanmaz.
- Faz sırası: 018 tooling → 019 breakpoint → 020 mobil → 021 dock/launcher → **022 motion/bento** (SON).

022 girdisi (020/021'den tracked, non-blocking):
- AiSuggestionBadge reasons hover-only (touch'ta ulaşılamaz) → 022'de tap Popover/Sheet.
- KpiCard delta renk asimetrisi (success-foreground vs destructive) → 022 polish + ikon/işaret (renk tek sinyal değil).
- FilterBar toolbar 320px'de sarıp içeriği aşağı itiyor → 022'de mobil filtre davranışını gözden geçir (ya da ayrı follow-up).

Backlog / faz sırası: docs/tasks/BACKLOG.md
Resume: "docs/tasks/CURRENT.md ve PROGRESS.md'yi oku, devam et".
