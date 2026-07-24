# Git Kurulumu & Faz Faz Commit Planı

> Bu dosya bir **runbook**'tur. Tüm komutları **siz** çalıştıracaksınız (CLAUDE.md git politikası: Claude commit/push atmaz).
> Repo şu an **git deposu değil** (`.git` yok). Aşağıdaki adımları sırayla uygulayın ve en alttaki **İşlem Günlüğü**'nü işaretleyin.

Çalışma dizini: `/Users/ali/Desktop/Arsam/arsam.net-admin-panel`
Mevcut durum: 176 kaynak dosya, tüm doğrulamalar yeşil (lint 0 hata · typecheck · test 393/393 · build · build-storybook).

---

## 0. GitHub'da boş repo oluşturma (ekrandaki "Create a new repository" sayfası)

Ekrandaki seçimleriniz **doğru**. Şunları uygulayın:

- **Owner:** `aliiball`
- **Repository name:** `Arsam.net-admin-panel` (available ✓)
  - Not: Yereldeki klasör `arsam.net-admin-panel` (küçük harf). GitHub adının büyük/küçük harfi kozmetiktir, sorun olmaz.
- **Description (opsiyonel):** `Enterprise admin panel for arsam.net — Turkish real-estate classifieds (React 19 + TS + Tailwind v4 + shadcn).`
- **Visibility:** İstediğinizi seçin. Öneri: iç proje ise **Private**.
- **Add README:** **Off** ← bizde zaten var, boş bırakın (ilk push'ta çakışmasın)
- **Add .gitignore:** **No .gitignore** ← bizde zaten `.gitignore` var
- **Add license:** **No license** (isterseniz sonra eklersiniz)
- **Create repository** butonuna basın.

⚠️ **Önemli:** README/.gitignore/license'ı GitHub'dan EKLEMEYİN. Eklerseniz repo boş olmaz ve ilk `push` reddedilir (o zaman `git pull --rebase` gerekir). Boş repo = temiz ilk push.

Repo oluşunca GitHub size "…or push an existing repository from the command line" komutlarını gösterir. Aşağıdaki adımlar onunla birebir aynı.

---

## 1. Yerel git init + remote bağlama

Terminalde proje dizinindeyken:

```bash
# Proje köküne geçin
cd /Users/ali/Desktop/Arsam/arsam.net-admin-panel

# Git başlat
git init

# Kullanıcı bilgisi (daha önce ayarlamadıysanız — global olarak bir kez yeterli)
git config user.name "Ali"
git config user.email "turksab.bt@gmail.com"

# node_modules/dist gerçekten ignore ediliyor mu? (bizde .gitignore hazır)
git status --short | head        # node_modules görünmemeli

# Uzak repoyu bağla (HTTPS ya da SSH — biri)
git remote add origin https://github.com/aliiball/Arsam.net-admin-panel.git
# veya SSH:
# git remote add origin git@github.com:aliiball/Arsam.net-admin-panel.git

# Ana dalı 'main' yap
git branch -M main
```

---

## 2. Commit stratejisi — İKİ seçenek

### ⚠️ Önemli teknik not (ikisini de okuyun)

Kod şu an **birleşik nihai halde**. Dosyalar arası ileri referanslar var — örn:
- `src/lib/msw/handlers.ts` → `src/features/listings/...` import ediyor
- `src/app/router.tsx` → hem `shell` hem `features/listings` import ediyor

Bu yüzden **ara commit'ler bağımsız olarak `npm run build`'i geçmez.** Sadece **son (tam) commit** yeşildir. Bu, faz faz commit'in "geçmişi güzelleştirme/diff okunabilirliği" için olduğu, "her commit'te checkout edip çalıştırma" için olmadığı anlamına gelir.

Buna göre:

- **Seçenek A (ÖNERİLEN, en basit, en güvenli):** Tek baseline commit. Her commit yeşil.
- **Seçenek B (opsiyonel, güzel history):** Faz faz commit. Diff'ler modül modül okunur ama ara commit'ler CI'da bağımsız geçmez (yukarıdaki not).

Bir tanesini seçin.

---

### Seçenek A — Tek baseline commit (ÖNERİLEN)

```bash
git add -A
git commit -m "feat: arsam.net admin panel foundation → listings vertical slice

Foundation (Vite 8 + React 19 + TS strict, Calm Signal design tokens, RR v7
data-mode, Storybook 10, MSW), configurable AppShell (sidebar/topnav + command
palette + mobile nav), P0 primitives + feedback, FieldHelp-enforced form system
+ wizard, URL-synced DataTable (10-point contract), and the listings vertical
slice (list/detail/create-wizard/moderation vs MSW + audit) with route-level RBAC.

Verified: lint + typecheck + test (393) + build + build-storybook all green.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

→ **3. Push** adımına geçin.

---

### Seçenek B — Faz faz commit (opsiyonel)

Sırayı **bağımlılık-güvenli** yaptım (önce alt katman, sonra üst). Her fazda önce `git add <dosyalar>`, sonra `git commit -m "<mesaj>"`.

#### Faz 1 — Foundation + proje dokümanları
Mevcut dokümanlar + araç zinciri + çekirdek lib/app + Button/Card.

```bash
git add \
  .gitignore .env.example README.md CLAUDE.md \
  package.json package-lock.json index.html \
  vite.config.ts vitest.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json \
  eslint.config.js components.json \
  .storybook/main.ts .storybook/preview.tsx .storybook/vitest.setup.ts \
  .github/ public/mockServiceWorker.js docs/ \
  src/vite-env.d.ts src/main.tsx src/test/setup.ts src/styles/theme.css \
  src/lib/utils.ts \
  src/lib/api/client.ts src/lib/api/types.ts \
  src/lib/msw/handlers.ts src/lib/msw/browser.ts src/lib/msw/server.ts src/lib/msw/handlers.test.ts \
  src/lib/query/query-client.ts \
  src/lib/layout/layout-context.tsx \
  src/lib/permissions/permissions.ts src/lib/permissions/permission-context.tsx \
  src/config/layout.ts \
  src/app/providers.tsx src/app/route-meta.ts src/app/router.tsx \
  src/app/pages/DemoPage.tsx src/app/pages/PlaceholderPage.tsx src/app/pages/ForbiddenPage.tsx \
  src/components/ui/button.tsx src/components/ui/button.stories.tsx \
  src/components/ui/card.tsx src/components/ui/card.stories.tsx

git commit -m "chore(foundation): scaffold Vite+React19+TS, Calm Signal tokens, RR data-mode, Storybook 10, MSW"
```

#### Faz 2 — P0 primitives + feedback
Tüm shadcn primitive'leri (Button/Card hariç) + feedback bileşenleri.

```bash
git add \
  src/components/ui/accordion.tsx src/components/ui/accordion.stories.tsx \
  src/components/ui/avatar.tsx src/components/ui/avatar.stories.tsx \
  src/components/ui/badge.tsx src/components/ui/badge.stories.tsx \
  src/components/ui/breadcrumb.tsx src/components/ui/breadcrumb.stories.tsx \
  src/components/ui/calendar.tsx src/components/ui/calendar.stories.tsx \
  src/components/ui/checkbox.tsx src/components/ui/checkbox.stories.tsx \
  src/components/ui/combobox.tsx src/components/ui/combobox.stories.tsx \
  src/components/ui/command.tsx src/components/ui/command.stories.tsx \
  src/components/ui/dialog.tsx src/components/ui/dialog.stories.tsx \
  src/components/ui/dropdown-menu.tsx src/components/ui/dropdown-menu.stories.tsx \
  src/components/ui/input.tsx src/components/ui/input.stories.tsx \
  src/components/ui/label.tsx src/components/ui/label.stories.tsx \
  src/components/ui/pagination.tsx src/components/ui/pagination.stories.tsx \
  src/components/ui/popover.tsx src/components/ui/popover.stories.tsx \
  src/components/ui/radio-group.tsx src/components/ui/radio-group.stories.tsx \
  src/components/ui/scroll-area.tsx src/components/ui/scroll-area.stories.tsx \
  src/components/ui/select.tsx src/components/ui/select.stories.tsx \
  src/components/ui/separator.tsx src/components/ui/separator.stories.tsx \
  src/components/ui/sheet.tsx src/components/ui/sheet.stories.tsx \
  src/components/ui/skeleton.tsx src/components/ui/skeleton.stories.tsx \
  src/components/ui/slider.tsx src/components/ui/slider.stories.tsx \
  src/components/ui/spinner.tsx src/components/ui/spinner.stories.tsx \
  src/components/ui/switch.tsx src/components/ui/switch.stories.tsx \
  src/components/ui/tabs.tsx src/components/ui/tabs.stories.tsx \
  src/components/ui/textarea.tsx src/components/ui/textarea.stories.tsx \
  src/components/ui/tooltip.tsx src/components/ui/tooltip.stories.tsx \
  src/components/feedback/

git commit -m "feat(ui): P0 primitives + feedback components with full Storybook coverage"
```

#### Faz 3 — Form sistemi
FieldHelp, FormField, wizard, error summary, cascading/range/date inputs.

```bash
git add src/components/form/
git commit -m "feat(form): FieldHelp-enforced FormField, wizard, error summary, cascading/range/date inputs"
```

#### Faz 4 — AppShell + layout modes
Tek nav-schema, iki shell, komut paleti, mobil nav, route guard.

```bash
git add src/config/nav-schema.ts src/components/shell/
git commit -m "feat(shell): configurable AppShell with sidebar/topnav modes, command palette, mobile nav"
```

#### Faz 5 — Data table
URL-sync DataTable, filtreler, bulk aksiyon, export, virtualization.

```bash
git add src/components/data-table/ src/lib/export.ts
git commit -m "feat(data-table): URL-synced DataTable with filters, bulk actions, export, virtualization"
```

#### Faz 6 — Listings dikey kesiti
features/listings uçtan uca + audit.

```bash
git add src/features/ src/lib/audit.ts
git commit -m "feat(listings): end-to-end vertical slice — list/detail/create-wizard/moderation vs MSW + audit"
```

#### Faz 7 — Kalan her şey (güvenlik ağı)
Yukarıda kaçan/yeni dosya varsa yakalar (ör. bu rehber, RouteGuard testleri vs.).

```bash
git add -A
git status --short          # boş olmalı ya da yalnızca beklenen dosyalar
git commit -m "chore: finalize DoD fixes (route RBAC guard, wizard aria, export scope) + git runbook"
```

> Not: Faz 4 (shell) commit'i Faz 2 (ui) + Faz 3 (form) sonrası gelmeli — bağımlılık böyle. Yukarıdaki sıra buna uygun.

---

## 3. Push (her iki seçenekte de aynı)

```bash
git push -u origin main
```

- HTTPS kullanıyorsanız kullanıcı adı + **Personal Access Token** (parola değil) ister.
- SSH kullanıyorsanız SSH anahtarınızın GitHub'da ekli olması gerekir.

Push sonrası GitHub'da **Actions** sekmesinde `.github/workflows/quality.yml` (Node 22 ile lint+typecheck+test+build+Storybook) otomatik koşacak.

---

## 4. Push sonrası doğrulama (opsiyonel ama önerilir)

```bash
git log --oneline            # commit geçmişini gör
git remote -v                # origin doğru mu
```
- GitHub Actions → "Quality" workflow yeşil mi kontrol edin.

---

## 5. Bundan sonra (planlama — sonra konuşacağız)

Repo bağlandıktan sonra sıradaki iş kalemleri (henüz YAPILMADI):
- **Hızlı düzeltmeler:** topnav başlık overlap bug'ı + gerçek Dashboard (şu an demo ping sayfası).
- **Faz 3 (roadmap):** kalan 9 modül (Kullanıcılar/Ofisler, Kategoriler, Lokasyonlar, Doping/Ödemeler, Mesajlar/Şikayetler, Raporlar, Denetim, RBAC matrisi, Ayarlar) — İlanlar dikeyini şablon alarak.
- **Faz 4 (roadmap):** AI-first katman (AssistantDock/Panel, NL kopilot), mobile-first cila, KpiCard/ChartCard/MapView, bundle code-split.
- **Bilinen eksikler:** DataTable kolon pinning/reorder; FilterBar `window.prompt` → Dialog; WCAG kontrast + a11y-addon raporu. (Detay: `docs/tasks/PROGRESS.md` son bölüm.)

---

## İşlem Günlüğü (siz doldurun)

Uyguladıkça işaretleyin. (Tarih/PAT gibi hassas bilgi YAZMAYIN.)

- [ ] GitHub'da boş repo oluşturuldu (README/gitignore/license OFF)
- [ ] `git init` + `git config user.*` yapıldı
- [ ] `git remote add origin …` bağlandı, `git branch -M main`
- [ ] Commit stratejisi seçildi: ☐ Seçenek A (tek)  ☐ Seçenek B (faz faz)
- [ ] Faz 1 commit ................. `git rev-parse --short HEAD` → __________
- [ ] Faz 2 commit ................. (B seçildiyse) → __________
- [ ] Faz 3 commit ................. (B seçildiyse) → __________
- [ ] Faz 4 commit ................. (B seçildiyse) → __________
- [ ] Faz 5 commit ................. (B seçildiyse) → __________
- [ ] Faz 6 commit ................. (B seçildiyse) → __________
- [ ] Faz 7 commit ................. (B seçildiyse) → __________
- [ ] `git push -u origin main` başarılı
- [ ] GitHub Actions "Quality" workflow: ☐ yeşil ☐ kırmızı (kırmızıysa log'u paylaşın)
- [ ] Planlama görüşmesine hazır

### Notlar (serbest)
> (Karşılaştığınız sorunları buraya yazın; sonraki oturumda bakarız.)
```

