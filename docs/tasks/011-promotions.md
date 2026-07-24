# Task 011 — Doping & Ödemeler

## Objective
Doping (öne çıkarma) paketlerini ve **ödemeler/faturalar/iade** akışını finance rolüne bağla. Nav'da `promotions`
(`/promotions`, permission `promotion.sell`) çocuklarıyla ZATEN var: `Doping Paketleri` (`/promotions`,
`promotion.sell`) ve `Ödemeler & Faturalar` (`/promotions/payments`, `payment.refund`) — ikisi de bugün
PlaceholderPage. Bu görev, önceki dikeylerin (users/messages) desenini alarak İKİ kaynağı uçtan uca yapar:
(1) doping paketleri CRUD + aktif/pasif; (2) ödeme kayıtları list/detail + **iade** (refund) moderasyon aksiyonu.
Her yazma `lib/audit`'e düşsün; iade guardrail'i (reason zorunlu) server-side `safeParse` ile GERÇEKTEN uygulansın.

## Şablon (008 categories + 010 messages dikeylerinden — birebir yeniden kullan)
- Şema kaynağı-hakikat: `features/promotions/schemas/*` (Zod → `type` infer). İki entity: `dopingPackage` +
  `payment` (satır kalemleri/paket referansı ile). Ortak yardımcılar gerekiyorsa `lib/order`'ı paylaş.
- MSW: merkezi registry'ye ekle; her yazma `lib/audit`'e immutable kayıt (`package.create|update|archive`,
  `payment.refund` — iade reason-required refine ile; kısmi/tam iade ayrımı payload'da).
- Hooks: `usePackages`/`usePackage` + `useUpsertPackage`/`useArchivePackage`; `usePayments`/`usePayment` +
  `useRefundPayment` (optimistic status flip: paid→refunded / partially-refunded + rollback + sonner toast).
  `page-story-utils` + audit + DataTable(`meta`) + FormField/FieldHelp + `seedQueryError` (010'da eklendi) yeniden kullan.
- Sayfalar:
  - Paketler List (`/promotions`): DataTable (ad, süre/gün, fiyat, tür [öne-çıkar/vitrin/acil/üst-sıra], durum) +
    "Yeni paket" `PackageFormDialog` (RHF + FieldHelp; fiyat numeric-string-then-parse) + bulk-archive + export.
  - Ödemeler List (`/promotions/payments`): DataTable (fatura no, kullanıcı, paket, tutar, yöntem, durum, tarih) +
    faceted filtreler (durum/yöntem/tarih aralığı) + NL parser + export; satır → iade guardrail'li Ödeme Detayı.
  - Ödeme Detail (`/promotions/payments/:id`): fatura özeti + satır kalemleri + `RefundDialog` (reason zorunlu,
    tam/kısmi tutar) + audit timeline.
- Nav + rotalar: her iki PlaceholderPage'i gerçek sayfalara çevir (`router.tsx`); `payments/:id` detay + routeMeta.
- Permissions: paket aksiyonları `promotion.sell`, iade `payment.refund` (finance rolünde) — `<Can>` + route meta.

## Steps
1. **Şemalar** (`features/promotions/schemas`): `dopingPackageSchema` (id, name, kind: enum [featured/showcase/
   urgent/top], durationDays, price, status: 'active'|'archived', order), `paymentSchema` (id, invoiceNo, userId,
   userName, packageId, packageName, amount, method: enum [card/transfer/wallet], status: 'paid'|'refunded'|
   'partially-refunded'|'failed', createdAt, refundedAmount?), `refundActionSchema` (amount + reason;
   reason-required + amount>0 ve ≤ kalan tutar refine), form şemaları (`packageFormSchema` fiyat/gün numeric-string,
   `refundFormSchema` ≥5-char reason). Fiyat/tutar: string-then-parse (005/Wizard dersi — zod-coerce'tan kaçın).
2. **Örnek veri + MSW** (`features/promotions/data` + `api/handlers`): tohum paket seti (4-6 paket) + tohum ödeme
   seti (kullanıcı/paket karışık, farklı yöntem + durum; bazıları refund'a uygun). Handlers: paket list/detail/
   create/patch(update|archive); ödeme list (filter durum/yöntem + tarih aralığı + ara, sort, paginate)/detail/
   `POST /payments/:id/refund`. Runtime `safeParse` → 422 (özellikle iade tutarı kalan tutarı aşarsa 422).
   Her yazma → `lib/audit`. Registry'ye kaydet.
3. **Hooks** (`features/promotions/api`): queries + mutations (paket upsert/archive optimistic; iade optimistic
   status flip + rollback).
4. **Bileşenler** (`features/promotions/components`): `PackageStatusBadge`, `PackageKindBadge` (ikon+etiket+aria),
   `PaymentStatusBadge`, `PaymentMethodBadge` (ikon+etiket+aria — renk tek sinyal değil), `PackageFormDialog`,
   `RefundDialog` (RHF + FieldHelp; tam/kısmi tutar + reason zorunlu; kalan tutarı aşamaz), `packageColumns`,
   `paymentColumns`.
5. **Sayfalar** (`features/promotions/pages`): PackagesListPage, PaymentsListPage, PaymentDetailPage (+ page-story-utils).
6. **Nav + rotalar + permissions**: iki PlaceholderPage'i gerçek sayfalara çevir; `payments/:id` detay + routeMeta; `<Can>`.
7. **Stories + testler**: tüm yeni bileşenler için tam-DoD stories (Default/Loading/Empty/Error/Mobile + play +
   a11y). Sayfa story'leri seeded-QueryClient + memory-router harness; **page `Error` story'leri `seedQueryError`
   ile GERÇEK isError** (010 deseni — Empty aynalamak YOK). Unit: handlers'ın audit yazdığını + iade guardrail'ının
   (reason zorunlu VE tutar>kalan) 422 döndürdüğünü + kısmi iadenin `partially-refunded` durumuna geçirdiğini kanıtla.

## Acceptance criteria
- [ ] Paketler CRUD + aktif/pasif ve ödemeler list/detail uçtan uca MSW'ye karşı çalışır; iade + reason + tutar guardrail'i.
- [ ] Her yazma `lib/audit`'e düşer; optimistic status flip + rollback + toast.
- [ ] Nav HER İKİ modda `promotions` + çocuklarını gösterir; paket aksiyonları `promotion.sell`, iade `payment.refund` gated.
- [ ] Tüm bileşenlerde tam story seti + play; page `Error` story'leri gerçek `isError`; strict TS; `any`/`@ts-ignore`
      yok; token-only; renk tek sinyal değil; touch target ≥44px; help/info için `title` YOK; row-selection varsa
      gerçek bulk action bağlı; HER form alanı `FormField`+`FieldHelp` (reason popover'ları da dahil — 010 dersi).
- [ ] Verify green (lint + typecheck + test + build) + build-storybook.
- [ ] DoD öz denetimi (`dod-reviewer`) PASS → PROGRESS checkpoint → **012 görev dosyasını yaz** →
      CURRENT'ı ilerlet → DUR → kullanıcı commit → `/clear`.

## Riskler / notlar
- **Para/tutar**: string-then-parse (005/Wizard `UseFormReturn<T>` uyumu — zod `coerce` transform generics çakışması).
  Tutarları tabular-nums + `tr-TR` binlik ayraç + `₺` son ek ile göster; hesaplamayı saf yardımcıda tut (unit-test).
- **İade guardrail'i type-only bırakma** (007 dersi): `refundActionSchema.safeParse` server-side; tutar>kalan → 422.
- **FieldHelp her yerde** (010 dersi): `RefundDialog` ve her reason/tutar alanı `FormField`+`FieldHelp` ile; ham
  `Label`+`Input`/`Textarea` YOK. Inline karar popover'ı kullanırsan içine `FieldHelp` + `aria-describedby` koy.
- **Three-tier importlama**: bu modülde three-tier moderasyon yok; iade tek bir guardrail'li aksiyon — purpose-built
  `RefundDialog` yaz (messages/users dialog desenini uyarla), `ModerationDecision`/`ReportDecision` importlama.
- `payment.refund` finance rolünde; `promotion.sell` de finance'te. Matris hazır — değişiklik gerekmeyebilir; gerekirse
  `docs/PERMISSIONS.md`'i senkron tut.
- Bundle zaten ~1.9MB; yeni ağır bağımlılık ekleme (route-level `lazy()` hâlâ Aşama 5'e ertelendi).
