# Task 022 — Aşama 6: Motion & Bento (son faz)

## Objective
Aşama 6'nın kapanış fazı: **ölü motion token'larını canlandır** ve dashboard'a **bento** düzeni getir. Bugüne
kadar `--duration-*` / `--ease-*` tokenları tanımlı ama neredeyse hiç kullanılmıyor. Amaç: ölçülü, token-güdümlü
mikro-etkileşimler (giriş/stagger, hover-lift, sparkline), `prefers-reduced-motion` MUTLAK korunur. Görsel dil
kendi paletimiz (Calm Signal) — abartılı animasyon YOK; "enterprise, sakin, amaca yönelik" his.

## Locked kararlar (Aşama 6)
- Referans (sahibinden-v2): SEÇİCİ uyarlama, birebir klon değil. Motion fikirleri alınır, süre/eğri kendi
  tokenlarımızla yeniden derilir.
- `prefers-reduced-motion: reduce` altında tüm non-essential motion devre dışı (mevcut base-layer kuralı korunur;
  yeni animasyonlar da bu kuralın kapsamına girmeli — transform/opacity animasyonları reduced-motion'da kapanmalı).
- Token-only: yeni keyframe/animasyonlar `theme.css`'te `--animate-*` / `--duration-*` / `--ease-*` üzerinden;
  bileşende hardcoded süre/eğri YOK.
- Yeni motion yüzeyleri de Storybook-first (play testleri motion'a bağımlı OLMAMALI — sonuç durumunu doğrula,
  animasyon süresini değil).

## Kapsam

### A. Motion primitifleri (theme.css + küçük yardımcılar)
- `theme.css`'e giriş/hover için `@keyframes` + `--animate-*` tokenları ekle (ör. `fade-in`, `fade-in-up`,
  `scale-in`). `--duration-*` / `--ease-*` tokenlarını kullan. Mevcut accordion pattern'i örnek al.
- Opsiyonel küçük `Motion`/`Stagger` yardımcı bileşeni ya da util class'ları (stagger için `animation-delay`
  token'lı adımlar). reduced-motion'da hepsi no-op.

### B. Interaktif Card hover-lift
- `Card`'a opsiyonel `interactive` varyantı (cva): hover'da hafif `translate-y` + `shadow-md`, token'lı süre/eğri;
  focus-visible ring; reduced-motion'da sadece renk/shadow (transform yok). Yalnızca tıklanabilir kartlarda.
- Dashboard/liste kartlarından uygun olanlara uygula (quick-links, KPI kartları vb.) — içerik kartları değil.

### C. KpiCard sparkline + delta rengi
- `KpiCard`'a opsiyonel `sparkline` (küçük recharts line/area, chart-1 token, eksen yok, ~40px) — trend serisi
  verilince gösterilir. `DashboardStats`'e hafif bir trend serisi ekleyip (mock, deterministik) bağla.
- **020 tracked:** KpiCard delta renk asimetrisini düzelt — pozitif `success-foreground`, negatif `destructive`
  yerine tutarlı bir çift (ör. success-foreground / destructive-foreground) + ikon/işaret (renk tek sinyal değil).

### D. Dashboard bento düzeni
- Dashboard grid'ini **bento**'ya çevir: farklı boyutlarda (2x1, 1x1, 2x2) kartlar, tek bir responsive grid
  (yeni breakpoint ölçeği; `xs/sm` mobilde 1-up, `lg`+ bento). KPI + kategori chart + donut + son kararlar +
  kuyruk önizleme yeniden yerleşir. İçerik aynı, düzen zenginleşir. Mobilde tek kolona düşer.

### E. Shape-matched skeleton'lar
- Yükleme iskeletlerini gerçek içerik şekline daha yakın hale getir (KPI kartı iskeleti = KPI kartı silüeti,
  chart iskeleti = chart alanı). DataTable zaten shape-matched (020); dashboard/detay kartlarına yay.

### F. 020/021 tracked non-blocking item'lar
- **020:** `AiSuggestionBadge` reasons hover-only (touch'ta ulaşılamaz) → tap ile Popover/Sheet (klavye + dokunma
  erişimi; tooltip-not-title kuralı). Bu, motion/interaction fazının doğal yeri.
- **020:** FilterBar toolbar 320px'de sarıp içeriği aşağı itiyor → mobil filtre davranışını gözden geçir (ayrı
  follow-up olabilir; en azından 320'de taşmayı hafiflet).
- **021:** (agent bulguları PROGRESS'e işlenecek — buraya devralınan blocking YOK; non-blocking varsa ele al.)

## Steps
1. `theme.css` motion tokenları (`@keyframes` + `--animate-*`), reduced-motion doğrulaması.
2. `Card` `interactive` varyantı + uygun yüzeylere uygula.
3. `KpiCard` sparkline + delta rengi düzeltmesi; `DashboardStats` mock trend serisi.
4. Dashboard bento grid.
5. Shape-matched skeleton'lar (dashboard/detay).
6. `AiSuggestionBadge` tap-erişilebilir reasons (Popover/Sheet).
7. Stories: interactive Card (hover/focus/reduced-motion), KpiCard sparkline, bento dashboard (bpXs/bpSm/bpLg/bpXl),
   AiSuggestionBadge tap. Play testleri sonuç-durumu doğrular, süre değil.
8. Agent'lar: `ux-design-critic` (motion ölçü/tutarlılık), `a11y-sentinel` (reduced-motion + tap-erişim +
   focus), `design-token-guardian` (motion token-only), `dod-reviewer`. Blocking'leri kapat.
9. Tam doğrulama: lint · typecheck · test · build · build-storybook — hepsi yeşil.

## Acceptance criteria
- [ ] Ölü motion tokenları kullanımda: token-güdümlü giriş/stagger + hover-lift; `prefers-reduced-motion`
      altında transform animasyonları kapanır (renk/shadow kalabilir).
- [ ] `Card interactive` varyantı: hover-lift + focus-visible ring, yalnızca tıklanabilir kartlarda, token'lı.
- [ ] `KpiCard` sparkline (trend verilince) + delta rengi renk-tek-sinyal-değil (ikon/işaret) + simetrik semantik.
- [ ] Dashboard bento düzeni; mobilde 1-up, `lg`+ zengin bento; içerik korunur.
- [ ] Shape-matched skeleton'lar (dashboard/detay kartları).
- [ ] `AiSuggestionBadge` reasons dokunmayla erişilebilir (Popover/Sheet), klavye + tooltip-not-title temiz.
- [ ] `bpXs/bpSm/bpLg/bpXl` story'leri + play (motion-bağımsız).
- [ ] lint · typecheck · test · build · build-storybook yeşil.
- [ ] `ux-design-critic` + `a11y-sentinel` + `design-token-guardian` + `dod-reviewer` çalıştırıldı; blocking kapandı.
- [ ] PROGRESS checkpoint → CURRENT güncelle (Aşama 6 TAMAM) → DUR → kullanıcı commit → `/clear`.

## Riskler / notlar
- Motion'ı ABARTMA: enterprise sakinliği koru; süreler `fast/base`, büyük/uzun animasyon yok.
- Play testleri animasyon süresine YASLANMAMALI — `findBy*` ile son durumu bekle, `waitFor` timeout'larını şişirme.
- Bento grid'i yeni breakpoint ölçeğiyle kur (019); mobil 1-up düşüşü kesin.
- Bu Aşama 6'nın SON fazı: bitince BACKLOG'da Aşama 6'yı "tamam" işaretle ve CURRENT'ı "Aşama 6 tamamlandı"ya çek.
