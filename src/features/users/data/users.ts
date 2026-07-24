/** User & office taxonomy: types, statuses, verification levels, labels. */

export const USER_TYPES = ['individual', 'agent', 'office'] as const;
export type UserType = (typeof USER_TYPES)[number];

export const USER_TYPE_LABELS: Record<UserType, string> = {
  individual: 'Bireysel',
  agent: 'Emlak Danışmanı',
  office: 'Emlak Ofisi',
};

export const USER_STATUSES = ['active', 'pending', 'suspended', 'banned'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  active: 'Aktif',
  pending: 'Onay bekliyor',
  suspended: 'Askıda',
  banned: 'Yasaklı',
};

export const VERIFICATION_LEVELS = ['none', 'pending', 'verified', 'rejected'] as const;
export type VerificationLevel = (typeof VERIFICATION_LEVELS)[number];

export const VERIFICATION_LABELS: Record<VerificationLevel, string> = {
  none: 'Yok',
  pending: 'İnceleniyor',
  verified: 'Doğrulandı',
  rejected: 'Reddedildi',
};

/** The three verifiable channels shown as VerificationBadges. */
export const VERIFICATION_CHANNELS = ['identity', 'office', 'phone'] as const;
export type VerificationChannel = (typeof VERIFICATION_CHANNELS)[number];

export const VERIFICATION_CHANNEL_LABELS: Record<VerificationChannel, string> = {
  identity: 'Kimlik',
  office: 'Ofis Belgesi',
  phone: 'Telefon',
};

/** User lifecycle actions (audit-mapped: user.verify|suspend|ban|unban). */
export const USER_ACTIONS = ['verify', 'suspend', 'ban', 'unban'] as const;
export type UserActionType = (typeof USER_ACTIONS)[number];

export const USER_ACTION_LABELS: Record<UserActionType, string> = {
  verify: 'Doğrula',
  suspend: 'Askıya al',
  ban: 'Yasakla',
  unban: 'Yasağı kaldır',
};
