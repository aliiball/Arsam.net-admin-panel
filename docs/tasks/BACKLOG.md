# Backlog — Faz Sırası (006 → 017)

> Büyük resmin `/clear`-güvenli, kalıcı hali. Tek satırlık sıralama; **detaylı spec** her fazda
> yalnızca sıradaki görev dosyasına yazılır (just-in-time — bir öncekinden öğrendiklerimizle).
> Aktif görev: `docs/tasks/CURRENT.md`. Tamamlananların kaydı: `docs/tasks/PROGRESS.md`.

## Tamamlanan
- **000–005** — Foundation → Listings dikey kesiti (marathon). ✅
- **Aşama 1** — topnav overflow fix + gerçek Dashboard (KpiCard/ChartCard/stats) + FilterBar save-view dialog. ✅
- **006 / Aşama 2** — Harita & dataviz (MapView + DonutChartCard; ilan detayı haritası + dashboard donut). ✅
- **007** — Kullanıcılar & Ofisler (doğrulama/askı/ban + trust skoru, three-tier moderasyon + audit). ✅
- **008** — Kategoriler & Nitelikler (taksonomi + dinamik nitelik seti CRUD, reorder, bulk-archive + audit). ✅

## Sıradaki fazlar
- **006 — Aşama 2: Harita & dataviz katmanı** — `MapView` (React Leaflet + markercluster), ek grafik
  varyantları (line/donut), ilan detayına harita + dashboard'a moderasyon-akışı/durum grafikleri.
- **007 — Kullanıcılar & Ofisler** — doğrulama/ban/trust skorlama; moderasyonla en bağlantılı modül.
  (Listings dikeyini şablon alır: schema → handlers → hooks → list/detail/verify pages → nav → permissions/audit.)
- **008 — Kategoriler & Nitelikler** — taksonomi + dinamik nitelik seti yönetimi (ilan formunu besler).
- **009 — Lokasyonlar** — il/ilçe/mahalle CRUD + cascading yönetimi.
- **010 — Mesajlar & Şikayetler** — mesaj/şikayet moderasyonu (three-tier akışı yeniden kullan).
- **011 — Doping & Ödemeler** — paketler, satın alma, fatura, iade (finance rolü).
- **012 — Raporlar & Analitik** — çok-grafikli dashboard'lar + export.
- **013 — Denetim Kaydı** — `lib/audit` üstüne AuditTimeline + filtrelenebilir denetim tablosu.
- **014 — RBAC** — roller/izin matrisi editörü (PermissionMatrixEditor), `docs/PERMISSIONS.md`.
- **015 — Ayarlar/Config** — layout defaults, feature flags, sistem ayarları.
- **016 — Aşama 4: AI-first katman** — AssistantDock/Panel, NL filtre kopilotu (gerçek parser),
  moderasyon kopilotu, AI toplu aksiyonlar (confirm-before-apply), agent hooks + guardrails.
- **017 — Aşama 5: Enterprise cila & performans** — route-level `lazy()` code-split, mobile-first ince
  ayar, WCAG kontrast + a11y-addon CI raporu, DataTable kolon pinning + drag-reorder.

## Çalışma ritmi (her faz)
1. Önceki fazı commit et (kullanıcı) → 2. `/clear` → 3. "docs/tasks/CURRENT.md oku, devam et" →
4. Uygula → doğrula (lint+typecheck+test+build) → DoD → PROGRESS checkpoint → **sonraki görev dosyasını yaz** →
CURRENT'ı ilerlet → DUR → 5. Kullanıcı commit → 6. `/clear` → sonraki faz.
