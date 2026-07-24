# Task 007 — Kullanıcılar & Ofisler

## Objective
Emlak pazaryerinin **kullanıcı & emlak-ofisi** modülünü uçtan uca ekle: doğrulama (kimlik/ofis
belgesi), ban/askıya alma, ve **trust skoru**. Bu, moderasyonla en bağlantılı ikinci dikey —
`features/listings`'in birebir şablonunu izler: Zod-first şema → MSW handlers → query/mutation
hooks → list/detail/verify sayfaları → nav → permissions + audit.

## Şablon (listings dikeyinden birebir)
- Şema kaynağı-hakikat: `features/users/schemas/*` (Zod → `type` infer).
- MSW: merkezi registry'ye ekle; yazma işlemleri `lib/audit`'e immutable kayıt yazsın
  (actor `ai:<agent>` destekli — three-tier / trust yeniden puanlama AI önerir, insan onaylar).
- Hooks: `useUsers` (keepPreviousData), `useUser`, `useVerifyUser`/`useBanUser` (optimistic +
  rollback + sonner toast).
- Sayfalar: List (DataTable + FilterBar), Detail (profil + trust + audit timeline), Verify/Moderate
  akışı (three-tier `ModerationDecision`'ı yeniden kullan: onayla / beklet / reddet-ban).
- Nav: `config/nav-schema.ts`'te `users` modülünü HER İKİ layout modunda göster; permission + aiEntity.
- Permissions: rota + aksiyonlar `<Can>` / route `permission` meta ile gated.

## Steps
1. **Şemalar** (`features/users/schemas`): `userSchema` (id, type: 'individual'|'agent'|'office',
   name, email, phone, status: 'active'|'pending'|'suspended'|'banned', trustScore 0–100,
   verification: {identity, office, phone} her biri 'none'|'pending'|'verified'|'rejected',
   listingsCount, joinedAt, lastActiveAt). `officeSchema` (bağlı ofis: unvan, vergiNo, üye ajanlar,
   il/ilçe). `userActionSchema` (verify/suspend/ban/unban + reason; ban/suspend/reject reason zorunlu).
   Trust skoru türetimi için saf `computeTrustScore(user)` yardımcı (unit-testable).
2. **Örnek veri + MSW** (`features/users/data` + `api/handlers`): ~30 kullanıcı/ofis mock (çeşitli
   status/verification/trust). Handlers: list (filter/sort/paginate), detail, verify, suspend, ban,
   unban. Her yazma → `lib/audit` (`user.verify|suspend|ban|unban`, before/after + reason).
   Registry'ye kaydet.
3. **Hooks** (`features/users/api`): queries + mutations (optimistic, rollback, toast) — listings
   mutation desenini birebir izle.
4. **Bileşenler** (`features/users/components`): `UserStatusBadge`, `TrustScoreMeter` (token-stilli
   0–100 meter; renk TEK sinyal olmasın — sayı + etiket), `VerificationBadges` (identity/office/phone
   rozetleri), `UserActionDialog` (ban/suspend gerekçe zorunlu — focus-managed popover/dialog).
5. **Sayfalar** (`features/users/pages`): List (DataTable: ad, tip, status, trust, doğrulama, ilan
   sayısı, kayıt tarihi; FilterBar: status/type/verification facet + trust range + il; bulk suspend/ban;
   export), Detail (profil kartı + TrustScoreMeter + VerificationBadges + bağlı ofis/ajanlar + ilan
   özeti + audit timeline + aksiyonlar), (opsiyonel) Offices alt-listesi ya da detay içi ofis kartı.
6. **Nav + rotalar + permissions**: `navSchema`'ya `users` (+ gerekirse `users/offices`) ekle, data-mode
   rotaları `routeMeta` ile bağla (list/detail), `RouteGuard` permission meta, `<Can>` gating.
7. **Stories + testler**: tüm yeni bileşenler için tam-DoD stories (Default/Loading/Empty/Error/Mobile +
   play + a11y). Sayfa story'leri seeded-QueryClient + memory-router harness (listings `page-story-utils`
   desenini yeniden kullan/genişlet). Unit: `computeTrustScore` + handlers'ın audit yazdığını kanıtla.

## Acceptance criteria
- [ ] Users list/detail/verify uçtan uca MSW'ye karşı çalışır; three-tier moderasyon yeniden kullanılır.
- [ ] TrustScoreMeter + VerificationBadges token-stilli; renk tek sinyal değil; a11y temiz.
- [ ] Ban/suspend/reject gerekçe ZORUNLU; her aksiyon `lib/audit`'e yazılır (AI önerir, insan onaylar).
- [ ] Nav HER İKİ modda `users`'ı gösterir; rota + aksiyonlar permission ile gated.
- [ ] Tüm bileşenlerde tam story seti + play; strict TS; `any`/`@ts-ignore` yok; token-only.
- [ ] Verify green (lint + typecheck + test + build) + build-storybook.
- [ ] DoD öz denetimi (`dod-reviewer`) PASS → PROGRESS checkpoint → **008 görev dosyasını yaz** →
      CURRENT'ı ilerlet → DUR → kullanıcı commit → `/clear`.

## Riskler / notlar
- Trust skoru türetimini saf fonksiyona ayır (unit-test; UI'dan bağımsız).
- FormField/FieldHelp: aksiyon dialoglarındaki gerekçe alanı help/helper zorunluluğuna uymalı.
- Ofis↔ajan ilişkisini basit tut (mock); tam CRUD gerekmez — doğrulama/ban/trust odak.
- Listings `page-story-utils` / audit / `ModerationDecision`'ı yeniden kullan — kopyalama değil paylaşım.
