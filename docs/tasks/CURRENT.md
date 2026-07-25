# Current Task
-> docs/tasks/020-mobile-ux.md

Status: NOT STARTED (Aşama 6 — Modernizasyon; 3. faz: Mobil UX düzeltmeleri).
Tasks 000–019 (+ Aşama 1–5) complete — see PROGRESS.md. Task 019 kullanıcı commit'i bekliyor.

Task 019 (Breakpoint Adopsiyonu) done: 8-token named scale (`@theme --breakpoint-*`:
xs320/sm480/md640/lg768/xl1024/2xl1280/3xl1536/4xl1920). **Strateji A** — Tailwind v4'te `@theme`'e
`--breakpoint-*` eklemek TÜM default ölçeği kaydırdığı için (sm/md/lg/xl/2xl), her mevcut prefix bir token
YUKARI kaydırılarak (sm→md, md→lg, lg→xl) 640/768/1024/1280 eşikleri BİREBİR korundu; shell/tablo convergence
hâlâ 1024'te. Yeni `xs`(320)/`sm`(480) token'ları 020/021 için additive. Content-grid'ler (Dashboard/Reports)
tek tek gerekçeyle remap/bırakıldı (KPI clip regresyonları düzeltildi). Storybook viewport'ları named ölçeğe
hizalandı + Tablet/Desktop convergence story'leri (viewport test runner'da gerçekten uygulanıyor).
4 agent çalıştı: token-guardian CLEAN, a11y PASS, ux-critic 2 High (fixed), dod-reviewer 4 blocking (hepsi fixed —
en kritiği: denetlenmemiş collateral sm/md kayması → up-one-token shift ile çözüldü). lint·typecheck·test(870/870,
2× yeşil)·build·build-storybook hepsi yeşil.

Mode: TASK (uygula → doğrula → DoD → PROGRESS checkpoint → sonraki görev dosyasını yaz → CURRENT ilerlet
→ DUR → kullanıcı commit → /clear).

Aşama 6 kilitli kararlar (BACKLOG.md'de detay):
- Referans (sahibinden-v2): SEÇİCİ uyarlama, birebir klon değil.
- Görsel: zengin cam / kendi OKLCH paletimiz, WCAG-kontrast güvenli.
- Nav: 3. layout modu `dock` (sidebar opsiyonel) + card-grid launcher + NL + context pill + notification.
- Breakpoint: 8-token named ölçek KURULDU (019); yeni yüzeyler `xs`/`sm` token'larını kullanabilir.
- Yeni yüzeyler feature-flag'li (canlı aç/kapa, geri alınabilir/revize edilebilir).
- Faz sırası: 018 agent tooling → 019 breakpoint → **020 mobil** → 021 dock/launcher → 022 motion/bento.

020 girdisi (019/018'den tracked): hiçbir list page `renderMobileCard` geçmiyor (hepsi generic dl/dt/dd) →
020'nin ana işi; a11y BLOCKER'lar (FilterBar NL aria-describedby, sub-44px radio/handle/pagination/bulk/chip
targets, isimsiz DatePicker'lar).

Backlog / faz sırası: docs/tasks/BACKLOG.md
Resume: "docs/tasks/CURRENT.md ve PROGRESS.md'yi oku, devam et".
