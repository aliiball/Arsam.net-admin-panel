# Task 010 — Mesajlar & Şikayetler

## Objective
Kullanıcı mesajlarını ve ilan/kullanıcı **şikayetlerini** moderasyon iş akışına bağla. Nav'da `messages`
(`/messages`, permission `message.moderate`) ZATEN var ve bugün PlaceholderPage. Bu görev, listings/users/
categories/locations dikeylerinin desenini alarak şikayet kuyruğunu list/detail ile uçtan uca CRUD + moderasyon
edilebilir yapar. Three-tier moderasyon akışını (OK / Belirsiz / NOK) yeniden kullan; her karar `lib/audit`'e düşsün.

## Şablon (007/008/009 dikeylerinden — birebir yeniden kullan)
- Şema kaynağı-hakikat: `features/messages/schemas/*` (Zod → `type` infer).
- MSW: merkezi registry'ye ekle; her yazma `lib/audit`'e immutable kayıt (`report.resolve|dismiss|escalate`,
  `message.hide|allow` — tek aksiyon ailesi, reason-required refine ile).
- Hooks: `useReports` (kuyruk listesi, keepPreviousData), `useReport` (detay + ilişkili mesaj/ilan/kullanıcı),
  `useReportAction` (optimistic status flip + rollback + sonner toast). `page-story-utils` + audit + DataTable(`meta`)
  + FormField/FieldHelp'i yeniden kullan.
- Sayfalar: List (şikayet tablosu: konu, tür [ilan/kullanıcı/mesaj], sebep-kategorisi, durum, öncelik, tarih;
  faceted filtreler + NL parser + bulk resolve/dismiss), Detail (`/messages/:id` — şikayet meta + alıntılanan
  içerik + three-tier `ReportDecision` [reason zorunlu, focus-managed popover] + audit timeline).
- Nav: `messages` route'unu PlaceholderPage'den gerçek sayfalara çevir (`router.tsx`); `:id` detay + routeMeta.
- Permissions: rota + aksiyonlar `<Can permission="message.moderate">` + route `permission` meta ile gated.
  (`message.moderate` şu an moderator + support rollerinde — matris hazır, değişiklik gerekmeyebilir.)

## Steps
1. **Şemalar** (`features/messages/schemas`): `reportSchema` (id, subjectType: 'listing'|'user'|'message',
   subjectId, subjectLabel, reasonCategory: enum [spam/dolandırıcılık/uygunsuz-içerik/yanlış-bilgi/diğer],
   description, status: 'open'|'resolved'|'dismissed'|'escalated', priority: 'low'|'normal'|'high',
   reporterName, createdAt), `reportActionSchema` (action + reason; resolve/dismiss/escalate → reason-required
   refine gibi 007'deki `userActionSchema`), `reasonFormSchema`. Saf yardımcılar gerekiyorsa `lib/order`'ı paylaş.
2. **Örnek veri + MSW** (`features/messages/data` + `api/handlers`): tohum şikayet seti (ilan/kullanıcı/mesaj
   karışık, farklı sebep + öncelik). Handlers: list (filter status/type/reasonCategory/priority + ara, sort,
   paginate), detail, tek `POST /reports/:id/action` (resolve/dismiss/escalate). Runtime `safeParse` → 422.
   Her yazma → `lib/audit`. Registry'ye kaydet.
3. **Hooks** (`features/messages/api`): queries + mutations (optimistic status flip).
4. **Bileşenler** (`features/messages/components`): `ReportStatusBadge`, `ReportPriorityBadge` (renk tek sinyal
   değil — ikon+etiket+aria-label), `ReasonCategoryBadge`, `ReportDecision` (three-tier; belirsiz/olumsuz kararda
   reason zorunlu — 005 `ModerationDecision` / 007 `UserActionDialog` desenini uyarlayan purpose-built bileşen),
   `reportColumns`.
5. **Sayfalar** (`features/messages/pages`): List + Detail (yukarıdaki gibi).
6. **Nav + rotalar + permissions**: `messages` route'unu gerçek sayfalara çevir; `:id` detay + routeMeta; `<Can>`.
7. **Stories + testler**: tüm yeni bileşenler için tam-DoD stories (Default/Loading/Empty/Error/Mobile + play +
   a11y). Sayfa story'leri seeded-QueryClient + memory-router harness (`page-story-utils` desenini yeniden kullan).
   Unit: handlers'ın audit yazdığını + reason-required guardrail'ın 422 döndürdüğünü kanıtla.

## Acceptance criteria
- [ ] Şikayet kuyruğu list/detail uçtan uca MSW'ye karşı çalışır; three-tier moderasyon + reason zorunluluğu.
- [ ] Her karar `lib/audit`'e düşer; optimistic status flip + rollback + toast.
- [ ] Nav HER İKİ modda `messages`'ı gösterir; rota + aksiyonlar `message.moderate` ile gated.
- [ ] Tüm bileşenlerde tam story seti + play; strict TS; `any`/`@ts-ignore` yok; token-only; renk tek sinyal değil;
      touch target ≥44px; help/info için `title` YOK; row-selection varsa gerçek bulk action bağlı.
- [ ] Verify green (lint + typecheck + test + build) + build-storybook.
- [ ] DoD öz denetimi (`dod-reviewer`) PASS → PROGRESS checkpoint → **011 görev dosyasını yaz** →
      CURRENT'ı ilerlet → DUR → kullanıcı commit → `/clear`.

## Riskler / notlar
- 009 DoD dersleri: page `Error` story'leri şu an `Empty`'yi aynalıyor (listings→locations boyunca ortak
  konvansiyon) — bu görevde gerçek `isError`/500 story'si ekleyerek deseni düzelt (küçük ama biriken borç).
- `size="icon"` override etme (44px koru), `title` kullanma, reason-required refine'ı server-side `safeParse` ile
  gerçekten uygula (007'deki gibi type-only bırakma).
- Three-tier bileşenini import-ederek-coupling yerine purpose-built yap (005 `ModerationDecision` `listing.*`
  izinlerine bağımlı; 007 gibi kendi bileşenini yaz, deseni yeniden kullan).
- Alıntılanan içerik (mesaj/ilan/kullanıcı) mock — ileride gerçek ilişki FastAPI ile gelir; şimdi `subjectLabel`
  + `subjectType` yeterli.
