# Backlog — Faz Sırası (006 → 022)

> Büyük resmin `/clear`-güvenli, kalıcı hali. Tek satırlık sıralama; **detaylı spec** her fazda
> yalnızca sıradaki görev dosyasına yazılır (just-in-time — bir öncekinden öğrendiklerimizle).
> Aktif görev: `docs/tasks/CURRENT.md`. Tamamlananların kaydı: `docs/tasks/PROGRESS.md`.

## Tamamlanan
- **000–005** — Foundation → Listings dikey kesiti (marathon). (tamam)
- **Aşama 1** — topnav overflow fix + gerçek Dashboard (KpiCard/ChartCard/stats) + FilterBar save-view dialog. (tamam)
- **006 / Aşama 2** — Harita & dataviz (MapView + DonutChartCard; ilan detayı haritası + dashboard donut). (tamam)
- **007** — Kullanıcılar & Ofisler (doğrulama/askı/ban + trust skoru, three-tier moderasyon + audit). (tamam)
- **008** — Kategoriler & Nitelikler (taksonomi + dinamik nitelik seti CRUD, reorder, bulk-archive + audit). (tamam)
- **009** — Lokasyonlar (il/ilçe/mahalle hiyerarşik CRUD, reorder, bulk-archive + audit; `lib/order` paylaşımı). (tamam)
- **010** — Mesajlar & Şikayetler (şikayet kuyruğu list/detail, three-tier moderasyon + reason + audit; ilk
  gerçek page-error story'leri `seedQueryError` ile). (tamam)
- **011** — Doping & Ödemeler (paket CRUD + aktif/arşiv; ödeme list/detail + guardrail'li iade [reason zorunlu +
  tutar ≤ kalan, server-side 422] + audit; finance rolü). (tamam)
- **012** — Raporlar & Analitik (READ-ONLY analitik: KPI + trend/huni/donut, per-chart export; `LineChartCard`). (tamam)
- **013** — Denetim Kaydı (READ-ONLY: filtrelenebilir `/audit` + paylaşılan `AuditTimeline`; saf `filterAuditEntries`). (tamam)
- **014** — RBAC (runtime-editable matris editörü; canlı-authz köprüsü; super-admin guardrail; toggle+audit). (tamam)
- **015** — Ayarlar/Config (sistem ayarları + canlı feature-flag köprüsü + layout defaults vs MSW + audit). (tamam)
- **016 / Aşama 4** — AI-first katman (deterministik parser/intent core, guardrail'li AI toplu-onay vs audit). (tamam)
- **017 / Aşama 5** — Enterprise cila (route-level code-split 2.04MB→543KB, 44px hedefler, DataTable kolon
  pinning + drag-reorder + klavye alternatifi, ChartCard a11y, gerçek page-error story'leri). (tamam)

## Sıradaki fazlar — Aşama 6: Modernizasyon (018 → 022)
> Referans (sahibinden-v2) SEÇİCİ uyarlama: etkileşim/düzen fikirleri alınır, birebir klon (cream palet,
> beyaz liquid-glass, font trio) ALINMAZ; her şey kendi OKLCH token'larımızla yeniden derilir.
> Kararlar: zengin cam / kendi paletimiz · 3. layout modu `dock` (sidebar opsiyonel) · breakpoint strateji A
> (1024 tablo-switch korunur) · yeni yüzeyler feature-flag'li (canlı aç/kapa, geri alınabilir).

- **018 — Kalite Agent'ları & Tooling** — proje-özel Tier-1 subagent'lar (design-token-guardian,
  a11y-sentinel, ux-design-critic, dead-code-hunter) + `docs/AGENTS.md` roster; governance doc güncelleme
  (Golden Rule 1 → "seçici uyarlama serbest / klon yasak"); docs emoji temizliği. Sonraki fazlar bu gate'lerden geçer.
- **019 — Breakpoint adopsiyonu + responsive re-audit** — 8-token ölçek (`@theme` --breakpoint-* :
  xs320/sm480/md640/lg768/xl1024/2xl1280/3xl1536/4xl1920); **strateji A**: 1024 tablo/kabuk-switch'i korumak
  için 27 `lg:`→`xl:` anlam-koruyucu remap; Storybook viewport'ları 320/480/768; tüm story/test yeşil.
- **020 — Mobil UX düzeltmeleri** — pagination wrap/kompakt; her list'e `renderMobileCard`; KPI `grid-cols-1`;
  dialog `max-w-[calc(100%-2rem)]`; RBAC matris + Reports Tabs mobil varyantı. (Yeni ölçeğe göre.)
- **021 — Floating Command Dock + Launcher** — 3. layout modu `dock` (sidebar gizli, command-driven nav);
  top-center pill = Arsam launcher + context pill ("Şu an: <sayfa>" + saat) + notification center (bell+badge,
  moderation/audit'ten türetilir); CommandPalette → card-grid launcher + nested quick-actions + NL kutusu
  (parser `lib/ai` hazır); **zengin cam kendi paletimizle**, WCAG-kontrast güvenli; yeni yüzeyler feature-flag'li.
- **022 — Motion & Bento** — ölü motion token'larını canlandır (giriş/stagger/hover-lift, reduced-motion korunur);
  interaktif Card hover-lift; KpiCard sparkline; dashboard bento düzeni; shape-matched skeleton'lar.

## Çalışma ritmi (her faz)
1. Önceki fazı commit et (kullanıcı) → 2. `/clear` → 3. "docs/tasks/CURRENT.md oku, devam et" →
4. Uygula → doğrula (lint+typecheck+test+build) → DoD (`dod-reviewer` + Aşama 6 sonrası yeni agent'lar) →
PROGRESS checkpoint → **sonraki görev dosyasını yaz** → CURRENT'ı ilerlet → DUR → 5. Kullanıcı commit → 6. `/clear`.
