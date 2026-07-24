/** Report/complaint taxonomy: subject types, reason categories, statuses, priorities, labels. */

/** What a complaint is filed against. */
export const REPORT_SUBJECT_TYPES = ['listing', 'user', 'message'] as const;
export type ReportSubjectType = (typeof REPORT_SUBJECT_TYPES)[number];

export const REPORT_SUBJECT_TYPE_LABELS: Record<ReportSubjectType, string> = {
  listing: 'İlan',
  user: 'Kullanıcı',
  message: 'Mesaj',
};

/** Why the complaint was filed. */
export const REASON_CATEGORIES = ['spam', 'fraud', 'inappropriate', 'misinformation', 'other'] as const;
export type ReasonCategory = (typeof REASON_CATEGORIES)[number];

export const REASON_CATEGORY_LABELS: Record<ReasonCategory, string> = {
  spam: 'Spam',
  fraud: 'Dolandırıcılık',
  inappropriate: 'Uygunsuz içerik',
  misinformation: 'Yanlış bilgi',
  other: 'Diğer',
};

/** Complaint lifecycle status. */
export const REPORT_STATUSES = ['open', 'resolved', 'dismissed', 'escalated'] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  open: 'Açık',
  resolved: 'Çözüldü',
  dismissed: 'Reddedildi',
  escalated: 'Üst mercide',
};

/** Triage priority. */
export const REPORT_PRIORITIES = ['low', 'normal', 'high'] as const;
export type ReportPriority = (typeof REPORT_PRIORITIES)[number];

export const REPORT_PRIORITY_LABELS: Record<ReportPriority, string> = {
  low: 'Düşük',
  normal: 'Normal',
  high: 'Yüksek',
};

/**
 * Moderation actions (audit-mapped: report.resolve|dismiss|escalate). The
 * three-tier decision maps OK→resolve, Belirsiz→escalate, NOK→dismiss;
 * escalate/dismiss require a reason (guardrail).
 */
export const REPORT_ACTIONS = ['resolve', 'dismiss', 'escalate'] as const;
export type ReportActionType = (typeof REPORT_ACTIONS)[number];

export const REPORT_ACTION_LABELS: Record<ReportActionType, string> = {
  resolve: 'Çözüldü olarak işaretle',
  dismiss: 'Şikayeti reddet',
  escalate: 'Üst mercie taşı',
};

/** Resulting status once an action is applied. */
export const REPORT_ACTION_STATUS: Record<ReportActionType, ReportStatus> = {
  resolve: 'resolved',
  dismiss: 'dismissed',
  escalate: 'escalated',
};
