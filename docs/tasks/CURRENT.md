# Current Task
-> docs/tasks/024-dock-pulse.md

Status: Task 023 (Motion follow-up polish) DONE — kullanıcı commit'ini bekliyor. Sıradaki: Task 024 (Dock pulse).

Aşama 6 (Modernizasyon, 018–022) TAMAMLANDI. Kullanıcının ek istekleri için post-modernization sıra:
**023 follow-up polish (DONE) → 024 dock pulse → 025 yönetici raporu (özet ağırlıklı, docs/report.html) →
026 GitHub Pages deploy (app + storybook + report, EN SON).**

Task 023 (Motion follow-up polish) done: ux-critic'in 022'de işaretlediği 3 non-blocking item kapatıldı.
- 14 sayfa header'ına `animate-fade-in` (reduced-motion güvenli). `card-interactive` yalnızca dashboard
  quick-access'te (çok-aksiyonlu moderation/mobil kartlara UYGULANMADI — belgelendi).
- KpiCard sparkline sağ-kolondan **tam-genişlik alt şeride**; `reserveSparkline` prop'u loading'de yüksekliği
  sabitler (dashboard 4 KPI kullanır; Reports etkilenmez).
- Bento `lg` mozaik: DonutChartCard legend'i **container-query** (`@container`+`@[26rem]:flex-row`) ile kartın
  genişliğine bağlı istiflenir (taşma yok); kategori+donut `lg`'de yan yana (span-1), `xl`'de span-2; grid
  `items-start` (sabit-yükseklik bar-chart zorla gerilmez → kasıtlı mozaik).
- **4 agent:** a11y-sentinel PASS (0 bulgu); token-guardian CLEAN; ux-critic 1 High (bento yükseklik → `items-start`)
  + 1 Medium (KPI loading shift → `reserveSparkline`) + 1 Medium (CommandCardLauncher → **Task 024'e devredildi**);
  dod-reviewer YES + 4 story-coverage önerisi (KpiCard LoadingReserved, DonutChartCard NarrowColumn, DashboardPage
  Tablet play + yorum tazeleme) kapatıldı.
- lint 0-error · typecheck · test 928/928 · build · build-storybook yeşil.
- NOT: Tailwind v4 `docs/` tarıyor → task markdown'ındaki `@[...]` literal'i CSS build'i kırdı, kaldırıldı. Task 025
  (rapor HTML) için: Tailwind source kapsamını `docs/`'tan ayır (`@source`).

## Task 024 — Dock pulse (sıradaki)
Referanstaki "kalp atışı" (breathing/pulse) etkisini **yalnızca `dock` layout modunda** entegre et: dock komut
pill'i / launcher'a token-güdümlü hafif scale-pulse (`--animate-pulse-*`, ~1↔1.04), `prefers-reduced-motion` MUTLAK
kapatır, Storybook + motion-bağımsız play. **Ek (023 devri):** CommandCardLauncher'daki yaprak (leaf) modül kartlarını
`Card interactive` + stretched-link (`after:inset-0`) grameriyle hizala (parent kartlar renk-only hover'da kalır).

Mode: TASK. Sıradaki adım: kullanıcı commit (023) → sonra Task 024.

Backlog / faz sırası: docs/tasks/BACKLOG.md
Resume: "docs/tasks/CURRENT.md ve PROGRESS.md'yi oku, devam et".
