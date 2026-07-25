# Task 023 — Aşama 6 sonrası: Motion follow-up polish (non-blocking devralınanlar)

## Objective
Task 022'nin (Motion & Bento) `ux-design-critic` tarafından işaretlenen üç non-blocking follow-up'ını kapat.
Amaç: motion vocabulary'sini tek sayfadan (dashboard) sisteme yay + KpiCard yoğunluğunu ve bento'nun `lg`
mozaikliğini iyileştir. Hepsi token-güdümlü, `prefers-reduced-motion` korunur, "enterprise-sakin".

## Kapsam
### A. Motion vocab app-geneli
- Her üst-düzey sayfanın `<header>`'ına `animate-fade-in` (dashboard'da zaten var). ~13 sayfa, tek satırlık.
- `card-interactive`: SADECE gerçek tek-tıklamalı navigasyon kartlarına. Uygulama tablo-merkezli; moderation
  kuyruğu kartları (link + onay/red butonları) ve mobil liste kartları (checkbox + actions) ÇOK-aksiyonlu →
  `card-interactive` onlara UYGULANMAZ (yanıltıcı olur). Dashboard quick-access zaten kapsıyor. Bu kararı belgele.

### B. KpiCard yoğunluğu
- Sağ-kolonda ikon + sparkline istifi yerine: sparkline'ı değerin altına **tam-genişlik ince şerit** olarak taşı
  (ikon köşede kalır). Trend yoksa şerit yok (Reports KpiCard'ları etkilenmez). Hâlâ chart-1 token, aria-hidden.

### C. Bento `lg` mozaik
- `DonutChartCard` legend yerleşimini viewport (`md:flex-row`) yerine **container-query** ile kartın kendi
  genişliğine bağla (`@container` + arbitrary container-query flex-row eşiği ~26rem) → dar kolonda donut+legend
  istiflenir, taşmaz.
- Bento'da kategori + donut kartlarını `lg`'de yan yana getir (`lg:col-span-2` → `xl:col-span-2`), böylece `lg`
  (768, 2-kolon) gerçek mozaik olur: `[cat][donut]` / `[pending tam]` / `[recent][quick]`. `xl` 4-up korunur.

## Steps
1. `animate-fade-in`'i tüm sayfa header'larına ekle.
2. `KpiCard` sparkline'ı tam-genişlik alt şeride taşı.
3. `DonutChartCard` container-query legend + bento span ayarı; `lg` mozaik doğrula (taşma yok).
4. Stories/guards güncelle (KpiCard Sparkline, DonutChartCard, DashboardPage Tablet/Desktop play).
5. Agent'lar: `design-token-guardian` + `a11y-sentinel` + `ux-design-critic` + `dod-reviewer`; blocking'leri kapat.
6. Tam doğrulama: lint · typecheck · test · build · build-storybook — hepsi yeşil.

## Acceptance criteria
- [x] Tüm üst-düzey sayfa header'ları `animate-fade-in` (reduced-motion'da no-op).
- [x] `card-interactive` yalnızca gerçek tek-tıklamalı kartlarda; çok-aksiyonlu kartlara uygulanmadı (belgelendi).
- [x] KpiCard sparkline tam-genişlik alt şerit; trend yoksa yok; aria-hidden korunur.
- [x] `lg`'de dashboard bento gerçek 2-kolon mozaik; donut dar kolonda taşmıyor (container-query).
- [x] lint · typecheck · test · build · build-storybook yeşil.
- [x] 4 agent çalıştırıldı; blocking kapandı; PROGRESS checkpoint → CURRENT ilerlet → DUR → commit.
