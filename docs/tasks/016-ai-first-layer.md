# Task 016 — Aşama 4: AI-first Katman (Assistant + Kopilotlar)

## Objective
Panelin dağınık AI-first parçalarını (data-action/data-entity nitelikleri, routeMeta, FilterBar'ın NL filtre
önerisi, AiSuggestionBadge, moderasyon "AI önerir/insan karar verir" akışı) **tek, tutarlı bir AI-first katmanına**
bağla: her yerden erişilebilir bir **AssistantDock/Panel**, GERÇEK (deterministik, kural-tabanlı) bir NL komut/filtre
**kopilotu**, ve **confirm-before-apply** guardrail'li AI toplu aksiyonları. Yeni bir LLM entegrasyonu YOK — "AI" burada
deterministik, test edilebilir bir parser + mevcut `aiSuggestion` verisi demek. Guardrail altını çiz: AI ÖNERİR,
insan ONAYLAR; her uygulanan aksiyon `lib/audit`'e `actor: 'ai:<agent>'` ile yazılır (audit modeli bunu zaten destekliyor).

## Şablon / yeniden kullanım
- **Canlı-köprü deseni (014/015 dersi):** Assistant durumu (açık/kapalı, aktif bağlam) için `useSyncExternalStore`
  ya da hafif bir context — `permission-store`/`feature-flags-store` ile aynı disiplin. Over-engineering yapma.
- **confirm-before-apply (011/015 dersi):** her AI-önerilen toplu aksiyon `ConfirmDialog` ile onaylanır; kritik/
  yıkıcı olanlar `destructive`. AI hiçbir şeyi sessizce uygulamaz.
- **Mevcut parçalar (yeniden kullan, yeniden yazma):**
  - `docs/AI_FIRST.md` — sözleşme (data-action/data-entity, routeMeta, aiEntity). Buna UY.
  - FilterBar'ın NL kutusu (Task 004) — filtreleri chip olarak öneriyor; parser'ı bir paylaşılan `lib/ai/`
    modülüne çıkar ve GERÇEK bir dil-bilgisiyle genişlet (fiyat/durum/kategori/il/tarih ifadeleri → filtre).
  - `AiSuggestionBadge` + `ModerationDecision` (listings) ve users/messages three-tier akışları — moderasyon
    kopilotu bunları çağırır, yeni moderasyon UI icat etme.
  - `CommandPalette` (⌘K) — assistant'ı buradan da aç (komut girişi köprüsü).
  - `nav-schema`'nın `aiEntity` alanı + `routeMeta` — assistant'ın "neredeyim / ne yapabilirim" bağlamı.

## Steps
1. **AI çekirdeği** (`src/lib/ai/`): SAF, deterministik, unit-testable.
   - `parseCommand(input, context)` → yapılandırılmış intent (`{ kind: 'filter'|'navigate'|'bulk-action'|'unknown',
     …payload }`). En az: NL filtre ifadeleri (mevcut FilterBar parser'ını buraya taşı + genişlet), rota navigasyonu
     ("ilanlara git"), ve bir toplu-aksiyon önerisi ("bekleyen ilanları onayla" → confirm gerektiren intent).
   - Zod ile intent şeması; `Date.now()`/argless `new Date()` YOK (deterministik — bağlamdaki "bugünü" veriden türet,
     012 analytics dersi). Kapsamı dar tut: 8-15 kural yeter; tanınmayan girdi `unknown` döner (asla tahmin uydurma).
2. **Assistant durumu** (`src/lib/ai/assistant-store.ts` veya context): açık/kapalı, aktif rota bağlamı, son öneriler.
   Canlı-köprü deseni. `useAssistant()` hook.
3. **Bileşenler** (`src/components/ai/`):
   - `AssistantDock` (mobil: bottom-sheet/drawer; desktop: sağ panel ya da köşe launcher — mobile-first) — bir komut
     input'u (`FieldHelp` ile), önerilen intent'leri **chip/kart** olarak gösterir, her biri **confirm-before-apply**.
   - `AssistantPanel` içeriği: bağlam başlığı ("Şu an: İlanlar"), komut kutusu, öneri listesi, son AI aksiyonları
     (audit'ten `actor` `ai:*` olanlar).
   - a11y: panel `role="dialog"`/`aria-label`, komut input'u label'lı + FieldHelp, öneri chip'leri 44px hit,
     renk tek sinyal değil (ikon+etiket). `title` attr YOK.
4. **Kopilot entegrasyonları** (mevcut dikeyler, minimal dokunuş):
   - **NL filtre kopilotu:** FilterBar zaten öneriyor — parser'ı `lib/ai`'den tüketecek şekilde refactor et
     (davranış eşdeğer, tek origin). En az bir liste sayfasında assistant'tan filtre uygulanabilsin.
   - **Moderasyon kopilotu:** bir liste/kuyruk bağlamında "AI'nın OK dediği bekleyenleri toplu onayla" gibi bir
     öneri → `ConfirmDialog` → mevcut moderate mutation'ları per-id çağır, her biri `actor: 'ai:copilot'` audit yazsın
     (mevcut audit yolu; `aiSuggestion === 'ok'` olanlarla sınırla — guardrail). Uncertain/NOK ASLA otomatik değil.
5. **Guardrails + hooks:** bir `applyIntent(intent, { confirm })` yolu — confirm olmadan hiçbir yazma yapılmaz;
   uygulanan her şey audit'e `ai:*` aktörüyle düşer. AI önerisi ile insan onayı arasındaki sınırı kod + testle kanıtla.
6. **Rota/erişim:** Assistant global (AppShell'e mount), ⌘K ve bir topbar/bottom-nav afadına bağlı. Yeni rota şart değil.
7. **Stories + testler:** `AssistantDock`/`AssistantPanel` tam-DoD stories (Default/Loading/Empty/Error/Mobile + play).
   Unit: `lib/ai/parseCommand` (deterministik intent üretimi — filtre/navigate/bulk/unknown), ve **confirm-before-apply
   guardrail testi** (confirm olmadan yazma/audit YOK; confirm ile `ai:*` audit yazılır; NOK/uncertain otomatik onaylanmaz).

## Acceptance criteria
- [ ] Her yerden açılabilen bir AssistantDock/Panel (⌘K + bir görünür afdans); mobile-first.
- [ ] `lib/ai/parseCommand` GERÇEK, deterministik bir parser; en az filtre + navigate + bulk-action + unknown intent'leri
      üretir; saf ve unit-testli (no `Date.now()`/argless `new Date()`).
- [ ] En az bir liste sayfasında assistant'tan NL komutla filtre uygulanabilir (mevcut FilterBar parser'ı `lib/ai`'e taşınmış).
- [ ] En az bir AI toplu aksiyonu (ör. AI-OK bekleyenleri onayla) **confirm-before-apply** ile çalışır; uygulanınca
      `lib/audit`'e `actor: 'ai:<agent>'` yazar; NOK/uncertain otomatik onaylanmaz (guardrail, testle kanıtlı).
- [ ] `docs/AI_FIRST.md` sözleşmesine uyum: yeni interaktif öğeler `data-action`/`data-entity` taşır.
- [ ] Tam story seti + play; page/panel `Error` story gerçek durum; strict TS; `any`/`@ts-ignore` yok; touch target ≥44px;
      help/info için `title` YOK; token-only.
- [ ] Verify green (lint + typecheck + test + build) + build-storybook.
- [ ] DoD öz denetimi (`dod-reviewer`) PASS → PROGRESS checkpoint → **017 görev dosyasını yaz** → CURRENT'ı ilerlet →
      DUR → kullanıcı commit → `/clear`.

## Riskler / notlar
- **"Gerçek AI" beklentisi:** LLM YOK. Parser deterministik kural-tabanlı; bunu net belirt (kullanıcıya "kural-tabanlı
  kopilot" olduğu şeffaf olsun, sahte-zeka pazarlama yapma). Bu, test edilebilirliği ve determinizmi korur (012/013 dersi).
- **Kapsam patlaması:** her dikeye kopilot bağlamaya çalışma. 1 NL-filtre entegrasyonu + 1 moderasyon toplu-aksiyonu
  YETER; gerisini ertele + PROGRESS'e not düş. Assistant iskeleti + saf parser + guardrail çekirdek teslimat.
- **Guardrail her şeydir:** AI'nın sessiz yazması = kırmızı çizgi. Tüm yazma yolları confirm + audit `ai:*`'tan geçmeli;
  bunu bir testle kilitle (011/015 confirm-before-apply + audit deseni).
- **Global mutable store izolasyonu (015 dersi):** assistant/store test'leri `afterEach` reset; story global store
  mutasyonu yaparsa `beforeEach`+cleanup ile izole et ve varsayımı yorumla.
- **Determinizm:** "bugün"/tarih ifadelerini veriden türet; `Date.now()`/argless `new Date()` script/parser'da YASAK.
- **a11y:** panel focus-trap + `aria-label`; komut input FieldHelp'li; öneri chip'leri 44px; renk tek sinyal değil.
