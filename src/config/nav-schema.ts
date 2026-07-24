import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Building2,
  Users,
  FolderTree,
  MapPin,
  BadgePercent,
  MessagesSquare,
  BarChart3,
  ScrollText,
  ShieldCheck,
  Settings,
} from 'lucide-react';

import type { Permission } from '@/lib/permissions/permissions';

/**
 * Single source of truth for navigation. Rendered by BOTH shells (sidebar +
 * topnav) and by the mobile drawer / bottom nav / command palette.
 */
export interface NavItem {
  id: string;
  /** English key; Turkish UI label shown to end users. */
  label: string;
  icon: LucideIcon;
  to: string;
  permission?: Permission;
  /** Groups: sidebar sub-sections / topnav mega-menu columns. */
  children?: NavItem[];
  /** For the AI copilot to map intents to modules. */
  aiEntity?: string;
  /** Eligible for the mobile bottom nav (<=5 primary items). */
  primary?: boolean;
}

export const navSchema: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Genel Bakış',
    icon: LayoutDashboard,
    to: '/',
    aiEntity: 'dashboard',
    primary: true,
  },
  {
    id: 'listings',
    label: 'İlanlar',
    icon: Building2,
    to: '/listings',
    permission: 'listing.view',
    aiEntity: 'listing',
    primary: true,
    children: [
      { id: 'listings-all', label: 'Tüm İlanlar', icon: Building2, to: '/listings', permission: 'listing.view', aiEntity: 'listing' },
      { id: 'listings-moderation', label: 'Moderasyon Kuyruğu', icon: ShieldCheck, to: '/listings/moderation', permission: 'listing.approve', aiEntity: 'listing' },
    ],
  },
  {
    id: 'users',
    label: 'Kullanıcılar & Ofisler',
    icon: Users,
    to: '/users',
    permission: 'user.view',
    aiEntity: 'user',
    primary: true,
    children: [
      { id: 'users-all', label: 'Kullanıcılar', icon: Users, to: '/users', permission: 'user.view', aiEntity: 'user' },
      { id: 'users-agents', label: 'Emlak Ofisleri', icon: Building2, to: '/users/agents', permission: 'agent.verify', aiEntity: 'agent' },
    ],
  },
  {
    id: 'categories',
    label: 'Kategoriler & Nitelikler',
    icon: FolderTree,
    to: '/categories',
    permission: 'category.manage',
    aiEntity: 'category',
  },
  {
    id: 'locations',
    label: 'Lokasyonlar',
    icon: MapPin,
    to: '/locations',
    permission: 'location.manage',
    aiEntity: 'location',
  },
  {
    id: 'promotions',
    label: 'Doping & Ödemeler',
    icon: BadgePercent,
    to: '/promotions',
    permission: 'promotion.sell',
    aiEntity: 'promotion',
    children: [
      { id: 'promotions-packages', label: 'Doping Paketleri', icon: BadgePercent, to: '/promotions', permission: 'promotion.sell', aiEntity: 'promotion' },
      { id: 'promotions-payments', label: 'Ödemeler & Faturalar', icon: ScrollText, to: '/promotions/payments', permission: 'payment.refund', aiEntity: 'payment' },
    ],
  },
  {
    id: 'messages',
    label: 'Mesajlar & Şikayetler',
    icon: MessagesSquare,
    to: '/messages',
    permission: 'message.moderate',
    aiEntity: 'message',
    primary: true,
  },
  {
    id: 'reports',
    label: 'Raporlar & Analitik',
    icon: BarChart3,
    to: '/reports',
    permission: 'report.view',
    aiEntity: 'report',
  },
  {
    id: 'audit',
    label: 'Denetim Kaydı',
    icon: ScrollText,
    to: '/audit',
    permission: 'audit.view',
    aiEntity: 'audit',
  },
  {
    id: 'rbac',
    label: 'Roller & İzinler',
    icon: ShieldCheck,
    to: '/rbac',
    permission: 'rbac.manage',
    aiEntity: 'rbac',
  },
  {
    id: 'settings',
    label: 'Ayarlar',
    icon: Settings,
    to: '/settings',
    permission: 'settings.manage',
    aiEntity: 'settings',
  },
];

/** Flatten the schema (self + children) for command palette / route mapping. */
export function flattenNav(items: NavItem[] = navSchema): NavItem[] {
  return items.flatMap((item) => (item.children ? [item, ...item.children] : [item]));
}
