# Current Task
-> docs/tasks/027-github-pages-deploy.md (henüz yazılmadı — Task 026 commit'inden sonra başlanacak)

Status: Task 026 (Yönetici raporu — docs/report.html) DONE — kullanıcı commit'ini bekliyor. Sıradaki: Task 027 (Pages deploy, EN SON).

Post-modernization sıra: 023 follow-up (DONE) → 024 dock pulse (DONE) → 025 edge nav dock (DONE) →
**026 yönetici raporu (docs/report.html) (DONE) → 027 GitHub Pages deploy (app + storybook + report, EN SON).**

## Task 026 — Yönetici raporu (DONE)
`docs/report.html` yazıldı: tek-dosya, kendi stilini taşıyan (app Tailwind'ine bağlı DEĞİL — Tailwind `docs/`'u
taramıyor, `@source not` mevcut), yönetici-özeti ağırlıklı rapor. İçerik: hero + rakamlarla (12 modül · 938 test/155
dosya · 133 story · 56 primitif · 5 rol/15 izin · 5 inceleme ajanı) + yetenekler + 12 modül grid + Calm Signal palet
(gerçek OKLCH token'ları) + 3 yerleşim modu + kenar dock + AI-first + RBAC/audit + kalite süreci (5 ajan + DoD + doğrulama
hattı) + teknoloji yığını + yol haritası zaman çizelgesi. Tema-duyarlı (light/dark + manuel toggle, localStorage), duyarlı,
reduced-motion güvenli. GERÇEK veriler, uydurma yok; impersonation yok (kendi work-product'ımız). Görev dosyası:
`docs/tasks/026-manager-report.md`. Doğrulandı: headless Chromium'da light+dark+mobil render, 0 konsol hatası, `npm run build`
yeşil (docs taranmıyor).

Task 025 (Edge nav dock) done: referansın (sahibinden-v2 GlassDock/GlassDockVertical) **macOS-tarzı büyüteç dock'u**,
kendi `--glass*`/motion tokenlarımızla (liquid-glass klonu DEĞİL). DockShell'de 3 kenar (alt/sol/sağ), her biri bağımsız
flag'li (`edgeDockBottom/Left/Right`), masaüstü + mobil, dock modu. Kullanıcıyla canlı referans üzerinde çok kez iterasyon.
- **Kapalı:** 44px hit-box hint butonu (focus ring onda, asla solmaz) + ince cam bar → **kalp atışı nabzı** atar (kenar-başı
  faz-kaydırma, reduced-motion güvenli, kenardan içe puff); açılınca bar `opacity-0` (gri sekme yok). Kenardan 1 içeri (OS jesti).
- **Açık (hover/focus/Enter/tap):** stage (`inert` kapalıyken) kayarak gelir. **Alt** = büyüteç dock'u — icon'lar imlece göre
  büyür (proximity, CSS-smoothed, rAF YOK); **pill sabit** (resting-width + ortalanmış offset, icon'lar taşar). **Sol/sağ** =
  dikey dock + kayan highlight.
- **Modül-adı etiketi** (aria-hidden, fade-in) hem mouse-yakınlığı hem klavye-focus ile. Nav = izinli primary modüller + ⌘K.
  Kapanma: mouse-leave / Esc (focus döner) / blur / nav seçimi.
- **AppShell:** MobileBottomNav artık SADECE dock-dışı modlarda; dock modunda gezinme pill + kenar dock + ⌘K.
- **4 agent:** token-guardian CLEAN; a11y 2 BLOCKER (focus-ring solması, 44px) + 1 WARN (hover-only label) düzeltildi;
  ux 2 High (pill nefes alması, kenar-jesti) + 2 Medium (label anim, nabız faz) + Low düzeltildi; dod-reviewer (checkpoint'te
  çalışıyordu — blocking çıkarsa PROGRESS'e follow-up).
- lint 0-error · typecheck · test 938/938 · build · build-storybook yeşil (aralıklı env-flake, warm re-run temiz).

## Task 027 — GitHub Pages deploy (sıradaki, EN SON, henüz task dosyası yok)
App + Storybook + rapor (`/report`) tek Pages sitesine dağıtılır. Vite `base` yolu, Storybook static build, rapor
kopyalama ve GitHub Actions Pages workflow'u. Task 026 commit'inden sonra başlanacak.

Mode: TASK. Sıradaki adım: kullanıcı commit (026) → sonra Task 027.

Backlog / faz sırası: docs/tasks/BACKLOG.md
Resume: "docs/tasks/CURRENT.md ve PROGRESS.md'yi oku, devam et".
