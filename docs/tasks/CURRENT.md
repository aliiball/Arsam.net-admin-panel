# Current Task
-> docs/tasks/021-command-dock-launcher.md

Status: NOT STARTED (Aşama 6 — Modernizasyon; 4. faz: Floating Command Dock + Launcher).
Tasks 000–020 (+ Aşama 1–5) complete — see PROGRESS.md. Task 020 kullanıcı commit'i bekliyor.

Task 020 (Mobil UX) done: shared `MobileListCard` helper (title/link → badges → 2-up meta → actions) wired into
ALL 9 list pages (generic dl/dt/dd fallback now dead everywhere; select+bulk preserved). Compact mobile
pagination (`<sm` first/last collapse + `x/y` counter). KPI 1-up on smallest screen (Dashboard `sm:grid-cols-2`,
Reports `md:grid-cols-2` for wide ₺ values) + `KpiCard` `truncate`/responsive value. Dialog mobile width
`w-[calc(100%-2rem)]`+`max-h dvh`+scroll. RBAC matrix sticky-left scroll + `<xl` gesture hint. DataTable loading
skeleton now shape-matched (mobile card skeleton `xl:hidden`); density/colvis hidden below xl. **018/019 tracked
a11y BLOCKERs CLOSED:** FilterBar NL `aria-describedby` (+visible helper, `useId`), both date-range DatePickers
`aria-label`, radio/chip-remove 44px pseudo hit-area, `size-8` overrides dropped (pagination/bulk → 44px),
resize/reorder handle hit-zones widened. 4 agents ran: token CLEAN, a11y 0 BLOCKER/3 WARN (all fixed),
ux-critic 1 High+4 Medium (fixed; 3 deferred/tracked), dod-reviewer NO→YES after adding KpiCard/Dashboard bpXs
regression-guard stories. lint·typecheck·test(889/889)·build·build-storybook hepsi yeşil.

Mode: TASK (uygula → doğrula → DoD → PROGRESS checkpoint → sonraki görev dosyasını yaz → CURRENT ilerlet
→ DUR → kullanıcı commit → /clear).

Aşama 6 kilitli kararlar (BACKLOG.md'de detay):
- Referans (sahibinden-v2): SEÇİCİ uyarlama, birebir klon değil (cream palet / beyaz liquid-glass / font trio ALINMAZ).
- Görsel: zengin cam / kendi OKLCH paletimiz, WCAG-kontrast güvenli.
- Nav: 3. layout modu `dock` (sidebar opsiyonel) + card-grid launcher + NL + context pill + notification center.
- Breakpoint: 8-token named ölçek (019); yeni yüzeyler `xs`/`sm` token'larını kullanır (yeni kodda `sm`=480, `md`=640, `lg`=768, `xl`=1024, `2xl`=1280).
- Yeni yüzeyler feature-flag'li (canlı aç/kapa, geri alınabilir/revize edilebilir).
- Faz sırası: 018 tooling → 019 breakpoint → 020 mobil → **021 dock/launcher** → 022 motion/bento.

021 girdisi (020'den tracked, non-blocking — 021'de değil, ilgili fazlarda ele alınacak):
- AiSuggestionBadge reasons hover-only (touch'ta ulaşılamaz) → 022 motion/interaction fazında tap Popover/Sheet.
- KpiCard delta renk asimetrisi (success-foreground vs destructive) → 022 polish.
- FilterBar toolbar 320px'de sarıp içeriği aşağı itiyor → ayrı follow-up (mobil filtre sheet'i düşün).

Backlog / faz sırası: docs/tasks/BACKLOG.md
Resume: "docs/tasks/CURRENT.md ve PROGRESS.md'yi oku, devam et".
