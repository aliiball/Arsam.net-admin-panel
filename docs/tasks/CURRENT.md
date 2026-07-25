# Current Task
-> (none) — Aşama 6 (Modernizasyon) TAMAMLANDI. Sıradaki fazı seçmek için BACKLOG.md'ye bak.

Status: Aşama 6 (Modernizasyon) COMPLETE. Tasks 000–022 (+ Aşama 1–5) tamam — PROGRESS.md'de detay.
Task 022 (Motion & Bento, SON faz) kullanıcı commit'ini bekliyor.

Task 022 (Motion & Bento) done: ölü `--duration-*`/`--ease-*` tokenları canlandırıldı + dashboard bento'ya geçti.
- **Motion** (`theme.css`): `fade-in`/`fade-in-up`/`scale-in` keyframe'leri + `--animate-*` tokenları (duration/ease
  güdümlü), `.card-interactive` hover-lift, `.stagger-children` util (`--stagger-step` adımlı), `--lift-y`. Reduced-motion
  base kuralı `animation-delay`/`transition-delay`'i de sıfırlar + `.card-interactive` transform'u kapanır (shadow kalır).
- **Card `interactive`** varyantı (cva): hover-lift + `focus-within` ring, sadece tıklanabilir kartlarda (dashboard
  hızlı-erişim, stretched-link + `min-h-11`).
- **KpiCard**: opsiyonel `trend` → ~40px recharts sparkline (chart-1, aria-hidden); simetrik delta pill (tint + ok +
  `+/−` işaret; renk tek sinyal değil). Yeni `--destructive-tint-foreground` on-tint token'ı AA'yı geçirir
  (6.99:1 light / 7.17:1 dark, pozitif branch'le simetrik). `DashboardStats`'e deterministik `makeTrend()` serisi.
- **Bento dashboard**: tek responsive grid — mobil 1-up / lg(768) 2-up / xl(1024) 4-up, span-1/span-2 boşluksuz;
  gerçek `isError`→`ErrorState` dalı; `EmptyState` tutarlılığı; `gap-4`; giriş stagger'ı. Canlı KPI'larda delta YOK
  (gerçek baz dönem yok — sparkline yönü taşır); delta özelliği story'lerde tam kanıtlı.
- **Shape-matched skeleton**: `ChartSkeleton` (bar silüeti) + `DonutSkeleton` (halka+legend); `ChartCard`/`DonutChartCard`
  `loading` prop'u. Dashboard `Loading`/`Empty`/`Error` story'leri yeni `seedQueryLoading` ile GERÇEK query durumlarını sürer.
- **AiSuggestionBadge** (020 devralınan): hover-only Tooltip → tap/klavye `Popover` (gerçek `<button>`, `title` yok),
  `after:-inset-3` görünmez hit-area (≥44px, play testinde `getBoundingClientRect` ile kilitli).

**4 agent çalıştı, tüm blocking'ler kapandı:** token-guardian CLEAN; ux-critic 2 High (error state yok + sahte delta) +
3 orta (hepsi düzeltildi); a11y-sentinel 1 BLOCKER (delta kontrastı, düzeltildi) + 2 WARN (dokunma hedefleri, düzeltildi);
dod-reviewer 1 BLOCKER (badge 42px → `-inset-3` 46px, düzeltildi) → NO→YES.
lint 0-error · typecheck · test 926/926 · build · build-storybook hepsi yeşil.

Mode: TASK. Sıradaki adım: kullanıcı commit → `/clear`.

Devralınan non-blocking (022 PROGRESS'te): motion vocabini app geneline yay (header `animate-fade-in`, tıklanabilir özet
kartlarda `card-interactive`); KpiCard sağ-kolon yoğunluğu (sparkline varken ikon?); bento sadece xl'de tam mozaik.

Backlog / faz sırası: docs/tasks/BACKLOG.md
Resume: "docs/tasks/CURRENT.md ve PROGRESS.md'yi oku, devam et".
