# Current Task
-> docs/tasks/019-breakpoint-adoption.md

Status: NOT STARTED (Aşama 6 — Modernizasyon; 2. faz: Breakpoint adopsiyonu + responsive re-audit).
Tasks 000–018 (+ Aşama 1–5) complete — see PROGRESS.md. Task 018 kullanıcı commit'i bekliyor.

Task 018 (Kalite Agent'ları) done: 4 read-only Tier-1 agent (`.claude/agents/`: design-token-guardian,
a11y-sentinel, ux-design-critic, dead-code-hunter) + `docs/AGENTS.md` roster; governance gevşetildi
(seçici uyarlama serbest / klon yasak — CLAUDE.md GR1 + DESIGN_SYSTEM.md); emoji taraması temiz. Config-only,
`src/` değişmedi. **Yeni agent'lar SONRAKİ oturumda `subagent_type` ile çağrılabilir.** 018 smoke-run bulguları
(a11y 44px/aria, dead-code 3 confirmed, ux notları) PROGRESS'te "Tracked" altında — 019/020 girdisi.

Mode: TASK (uygula → doğrula → DoD → PROGRESS checkpoint → sonraki görev dosyasını yaz → CURRENT ilerlet
→ DUR → kullanıcı commit → /clear).

Aşama 6 kilitli kararlar (BACKLOG.md'de detay):
- Referans (sahibinden-v2): SEÇİCİ uyarlama, birebir klon değil.
- Görsel: zengin cam / kendi OKLCH paletimiz, WCAG-kontrast güvenli.
- Nav: 3. layout modu `dock` (sidebar opsiyonel) + card-grid launcher + NL + context pill + notification.
- Breakpoint: strateji A (8-token ölçek; 1024 tablo-switch `lg:`→`xl:` remap ile korunur).
- Yeni yüzeyler feature-flag'li (canlı aç/kapa, geri alınabilir/revize edilebilir).
- Faz sırası: 018 agent tooling → 019 breakpoint → 020 mobil → 021 dock/launcher → 022 motion/bento.

Backlog / faz sırası: docs/tasks/BACKLOG.md
Resume: "docs/tasks/CURRENT.md ve PROGRESS.md'yi oku, devam et".
