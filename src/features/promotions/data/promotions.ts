/**
 * Promotions taxonomy: doping-package kinds + statuses, payment methods +
 * statuses, refund action, and Turkish labels. Icons keep color from being the
 * sole signal on badges.
 */
import type { LucideIcon } from 'lucide-react';
import { ArrowUpToLine, CreditCard, LayoutGrid, Landmark, Star, Wallet, Zap } from 'lucide-react';

/** Doping (promotion) package kind — how the listing is surfaced. */
export const PACKAGE_KINDS = ['featured', 'showcase', 'urgent', 'top'] as const;
export type PackageKind = (typeof PACKAGE_KINDS)[number];

export const PACKAGE_KIND_LABELS: Record<PackageKind, string> = {
  featured: 'Öne Çıkar',
  showcase: 'Vitrin',
  urgent: 'Acil',
  top: 'Üst Sıra',
};

export const PACKAGE_KIND_ICONS: Record<PackageKind, LucideIcon> = {
  featured: Star,
  showcase: LayoutGrid,
  urgent: Zap,
  top: ArrowUpToLine,
};

/** Package lifecycle status. Archived packages are hidden from new purchases. */
export const PACKAGE_STATUSES = ['active', 'archived'] as const;
export type PackageStatus = (typeof PACKAGE_STATUSES)[number];

export const PACKAGE_STATUS_LABELS: Record<PackageStatus, string> = {
  active: 'Aktif',
  archived: 'Arşivli',
};

/** Payment method. */
export const PAYMENT_METHODS = ['card', 'transfer', 'wallet'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  card: 'Kredi Kartı',
  transfer: 'Havale / EFT',
  wallet: 'Cüzdan',
};

export const PAYMENT_METHOD_ICONS: Record<PaymentMethod, LucideIcon> = {
  card: CreditCard,
  transfer: Landmark,
  wallet: Wallet,
};

/** Payment lifecycle status. */
export const PAYMENT_STATUSES = ['paid', 'refunded', 'partially-refunded', 'failed'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  paid: 'Ödendi',
  refunded: 'İade Edildi',
  'partially-refunded': 'Kısmi İade',
  failed: 'Başarısız',
};
