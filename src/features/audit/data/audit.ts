import { Bot, User } from 'lucide-react';

/**
 * Action families keyed by the segment before the first dot in an action string
 * (e.g. `listing.approve` -> `listing`). `attribute.*` writes belong to the
 * category domain, so they fold into `category`.
 */
export const ACTION_FAMILIES = [
  'listing',
  'user',
  'category',
  'location',
  'report',
  'package',
  'payment',
] as const;

export type ActionFamily = (typeof ACTION_FAMILIES)[number];

export const ACTION_FAMILY_LABELS: Record<ActionFamily, string> = {
  listing: 'İlan',
  user: 'Kullanıcı',
  category: 'Kategori',
  location: 'Lokasyon',
  report: 'Şikayet',
  package: 'Paket',
  payment: 'Ödeme',
};

/** Actor type: automated agent (`ai:<agent>`) vs a human operator. */
export const ACTOR_KINDS = ['human', 'ai'] as const;
export type ActorKind = (typeof ACTOR_KINDS)[number];

export const ACTOR_KIND_LABELS: Record<ActorKind, string> = {
  human: 'İnsan',
  ai: 'Yapay Zeka',
};

export const ACTOR_KIND_ICONS: Record<ActorKind, typeof Bot> = {
  human: User,
  ai: Bot,
};
