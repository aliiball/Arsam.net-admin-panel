# Task 018 — Aşama 6: Kalite Agent'ları & Tooling

## Objective
Sonraki modernizasyon fazlarını (019 breakpoint, 020 mobil, 021 dock/launcher, 022 motion) tutarlı
kalite gate'lerinden geçirmek için **proje-özel Tier-1 review agent'ları** kur. Bugüne dek `dod-reviewer`
tek proje-agent'ıydı ve PROGRESS log'u onun HEP aynı kategorilerde blocking yakaladığını gösteriyor
(≥44px hedef, FieldHelp/aria bağlama, token ihlali, eksik story, page-error). Bu agent'lar bu kategorileri
**commit öncesi otomatik ön-eleyerek** rework'ü düşürür ve kaliteyi kalıcılaştırır. Ek olarak modernizasyon
fazlarını meşru kılan **governance doc güncellemesi** ve **docs emoji temizliği** bu fazda yapılır.

Bu faz **app kodu (`src/`) DEĞİŞTİRMEZ** — yalnızca `.claude/agents/*.md`, `docs/*` ve (opsiyonel) `.claude`
ayarları. Dolayısıyla lint/typecheck/test/build zaten yeşil kalmalı.

## Kapsam — Tier-1 agent'lar (`.claude/agents/*.md`, `dod-reviewer` gibi salt-okunur)
Her agent: frontmatter (`name`, `description`, `tools`, uygun `model`), net bir system prompt (kontroller +
bizim kurallarımız + çıktı formatı: severity'li `file:line` bulgular). ASLA dosya düzenlemez.

1. **design-token-guardian** — `src/styles/theme.css` DIŞINDA hardcoded renk (hex/rgb/rgba/hsl/oklch),
   non-token spacing, `title` attribute'lu yardım, hardcoded gölge tarar. Golden Rule 2 (token-only) mekanik
   garantisi. Tools: Read, Grep, Glob, Bash. Model: haiku (mekanik).
2. **a11y-sentinel** — WCAG 2.2: ≥44px hit target, form alanlarında `aria-describedby` bağlama, "renk tek
   sinyal değil", `title` yerine Tooltip, role/label/accessible-name, focus yönetimi, `prefers-reduced-motion`.
   Tools: Read, Grep, Glob, Bash (gerekirse ilgili storybook a11y testini koşar). Model: sonnet.
3. **ux-design-critic** — sezgisel UI/UX incelemesi: görsel hiyerarşi, boşluk ritmi, motion tutarlılığı
   (motion token'ları kullanılıyor mu?), empty/loading/error cilası, mobil ergonomi (320/480/768),
   feature'lar arası tutarlılık, `docs/DESIGN_SYSTEM.md`'ye uyum. Tools: Read, Grep, Glob. Model: sonnet.
4. **dead-code-hunter** — kullanılmayan export/dosya/dependency, ulaşılamaz kod, orphan story/test.
   `npx knip` / `npx ts-prune` / `npx depcheck` on-demand (app'e kalıcı dep EKLEMEZ). Tools: Read, Grep,
   Glob, Bash. Model: haiku.

## Housekeeping (bu fazda)
- **Governance:** `CLAUDE.md` Golden Rule 1 + `docs/DESIGN_SYSTEM.md`'yi güncelle:
  "**Seçici uyarlama serbest, birebir klon yasak.** Referanstan etkileşim/düzen fikirleri alınır ama daima
  kendi OKLCH token'larımız, tip ölçeğimiz ve elevation'ımızla yeniden derilir. Klonlanmayacak: cream/kahve
  palet, birebir liquid-glass krom, referans font trio'su. Token'lı ölçülü saydamlık/blur, WCAG kontrastını
  geçerse serbesttir." (Kullanıcı bu gevşetmeye yetki verdi — dokümana yazılmazsa sonraki oturum "yasak"a döner.)
- **Emoji:** repo genelinde gerçek emoji taraması; bulunan piktografik emoji'leri metin işaretine çevir
  (BACKLOG.md bu fazda zaten temizlendi — kalan varsa docs'ta). `src/` zaten temiz (Task 017 sonrası doğrulandı).

## Steps
1. 4 agent `.md` dosyasını `.claude/agents/` altında yaz (frontmatter + kontrol listesi + çıktı formatı).
2. Her agent'ı mevcut `src/` üzerinde **smoke-run** et; anlamlı/aksiyon-alınabilir çıktı verdiğini doğrula,
   prompt'ları buna göre ayarla. (Bilinen mevcut durumları bulmalı: ör. token-guardian temiz raporlamalı,
   a11y-sentinel Task 017'de düzeltilenlerin ötesinde bir şey bulmamalı.)
3. Governance doc düzenlemeleri + emoji temizliği.
4. `docs/AGENTS.md` roster yaz: agent listesi + ne zaman kullanılır + `dod-reviewer` ile nasıl kompoze olurlar
   + ileride "release-readiness" Workflow fikri (hepsini paralel koşturup tek özet).
5. (Opsiyonel, düşük risk) mekanik bir hook: Stop/pre-commit'te token grep + typecheck. `settings.json`
   gerektirir; risk görülürse 019'a devret.

## Acceptance criteria
- [ ] 4 Tier-1 agent `.claude/agents/`'de mevcut, Task tool ile çağrılabilir; smoke-run'da her biri
      yapılandırılmış (severity'li, `file:line`) bulgu raporu döndürüyor.
- [ ] `src/` kodu değişmedi → lint · typecheck · test · build zaten yeşil (regresyon yok).
- [ ] Governance ifadesi `CLAUDE.md` + `DESIGN_SYSTEM.md`'de güncellendi; repo'da gerçek emoji kalmadı.
- [ ] `docs/AGENTS.md` roster yazıldı.
- [ ] PROGRESS checkpoint → CURRENT güncelle → **019 görev dosyasını yaz** → DUR → kullanıcı commit → `/clear`.

## Riskler / notlar
- Agent'lar app kodu değil config; "doğrulama" = smoke run + docs. App'e ağır dep EKLEME (dead-code araçları
  `npx` ile on-demand).
- Agent'lar `dod-reviewer` gibi **salt-okunur** — asla düzenlemez.
- Built-in `/code-review`, `/security-review` ile örtüşmeyi gürültüye çevirme: bu agent'lar BİZİM kurallarımızı
  ve bağlamımızı gömen uzmanlaşmalar. Fazla agent = gürültü; Tier-1'in dördüyle başla.
- security-sentinel + code-standards-enforcer (Tier-2) bilinçli olarak sonraya bırakıldı; ihtiyaç oldukça eklenir.
