# Current Task
-> (none) — modernization arc COMPLETE (Tasks 000 → 027 all done).

Status: Task 027 (GitHub Pages deploy — app + Storybook + report) DONE — kullanıcı commit'ini bekliyor.
Sonrasında yeni bir hedef gelene kadar backlog boş.

Post-modernization sıra: 023 follow-up (DONE) → 024 dock pulse (DONE) → 025 edge nav dock (DONE) →
026 yönetici raporu (DONE) → **027 GitHub Pages deploy (DONE).**

## Task 027 — GitHub Pages deploy (DONE)
`.github/workflows/pages.yml` yazıldı: app + Storybook (`/storybook/`) + rapor (`/report.html`) tek Pages sitesine
(`https://aliiball.github.io/Arsam.net-admin-panel/`) dağıtılır. Runtime uyarlamaları: `vite.config.ts` env-driven
`base` (`APP_BASE`), `router.tsx` `basename = import.meta.env.BASE_URL`, `main.tsx` MSW artık prod'da da (mock-only
demo; sadece test hariç), `browser.ts` base-aware service worker URL. SPA deep-link fallback = built `index.html` →
`404.html`. `package.json`'a `preview` script. Doğrulandı: lint 0-error · typecheck · test 939/939 (warm) · build
(base=/ ve base=/Arsam.net-admin-panel/) · build-storybook · Playwright ile `vite preview` üzerinde 4/4 runtime
(app boot, deep-link /listings + MSW, storybook, report), 0 konsol hatası. dod-reviewer: NO blocking, "Ready to commit: YES".
Görev dosyası: `docs/tasks/027-github-pages-deploy.md`.

## ⚠️ TEK SEFERLİK MANUEL ADIM (otomatikleştirilemez)
İlk `main` push'unun yayınlanması için: repo **Settings → Pages → Source = "GitHub Actions"** seçilmeli.
Workflow bunu kendisi yapamaz.

Mode: TASK. Sıradaki adım: kullanıcı commit (027) + Pages "Source: GitHub Actions" ayarı → sonra ilk `main` push yayınlar.

Backlog / faz sırası: docs/tasks/BACKLOG.md
Resume: "docs/tasks/CURRENT.md ve PROGRESS.md'yi oku, devam et".
</content>
