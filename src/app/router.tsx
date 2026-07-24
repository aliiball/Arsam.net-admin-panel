import { createBrowserRouter } from 'react-router-dom';

import { AppShell } from '@/components/shell/AppShell';
import { DashboardPage } from '@/features/dashboard';
import {
  ListingsListPage,
  ListingDetailPage,
  ListingCreatePage,
  ModerationQueuePage,
} from '@/features/listings';
import { UsersListPage, OfficesListPage, UserDetailPage } from '@/features/users';
import { CategoriesListPage, CategoryDetailPage } from '@/features/categories';
import { LocationsListPage, ProvinceDetailPage } from '@/features/locations';
import { ReportsListPage, ReportDetailPage } from '@/features/messages';
import { PackagesListPage, PaymentsListPage, PaymentDetailPage } from '@/features/promotions';
import { ReportsPage } from '@/features/reports';
import { AuditListPage } from '@/features/audit';
import { RbacPage } from '@/features/rbac';
import { PlaceholderPage } from './pages/PlaceholderPage';
import type { RouteHandle } from './route-meta';

const meta = (routeMeta: RouteHandle['routeMeta']): RouteHandle => ({ routeMeta });

/**
 * React Router v7 — DATA mode ONLY (createBrowserRouter). No framework mode,
 * no SSR/RSC. AppShell is the root layout; every route carries `handle.routeMeta`.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    Component: AppShell,
    children: [
      { index: true, Component: DashboardPage, handle: meta({ title: 'Genel Bakış', aiEntity: 'dashboard' }) },
      {
        path: 'listings',
        handle: meta({ title: 'İlanlar', permission: 'listing.view', aiEntity: 'listing' }),
        children: [
          { index: true, Component: ListingsListPage },
          {
            path: 'create',
            Component: ListingCreatePage,
            handle: meta({ title: 'Yeni İlan', permission: 'listing.edit', aiEntity: 'listing' }),
          },
          {
            path: 'moderation',
            Component: ModerationQueuePage,
            handle: meta({ title: 'Moderasyon Kuyruğu', permission: 'listing.approve', aiEntity: 'listing' }),
          },
          {
            path: ':id',
            Component: ListingDetailPage,
            handle: meta({ title: 'İlan Detayı', permission: 'listing.view', aiEntity: 'listing' }),
          },
        ],
      },
      {
        path: 'users',
        handle: meta({ title: 'Kullanıcılar & Ofisler', permission: 'user.view', aiEntity: 'user' }),
        children: [
          { index: true, Component: UsersListPage },
          {
            path: 'agents',
            Component: OfficesListPage,
            handle: meta({ title: 'Emlak Ofisleri', permission: 'agent.verify', aiEntity: 'agent' }),
          },
          {
            path: ':id',
            Component: UserDetailPage,
            handle: meta({ title: 'Kullanıcı Detayı', permission: 'user.view', aiEntity: 'user' }),
          },
        ],
      },
      {
        path: 'categories',
        handle: meta({ title: 'Kategoriler & Nitelikler', permission: 'category.manage', aiEntity: 'category' }),
        children: [
          { index: true, Component: CategoriesListPage },
          {
            path: ':id',
            Component: CategoryDetailPage,
            handle: meta({ title: 'Kategori Detayı', permission: 'category.manage', aiEntity: 'category' }),
          },
        ],
      },
      {
        path: 'locations',
        handle: meta({ title: 'Lokasyonlar', permission: 'location.manage', aiEntity: 'location' }),
        children: [
          { index: true, Component: LocationsListPage },
          {
            path: ':id',
            Component: ProvinceDetailPage,
            handle: meta({ title: 'İl Detayı', permission: 'location.manage', aiEntity: 'location' }),
          },
        ],
      },
      {
        path: 'promotions',
        handle: meta({ title: 'Doping & Ödemeler', permission: 'promotion.sell', aiEntity: 'promotion' }),
        children: [
          { index: true, Component: PackagesListPage },
          {
            path: 'payments',
            handle: meta({ title: 'Ödemeler & Faturalar', permission: 'payment.refund', aiEntity: 'payment' }),
            children: [
              { index: true, Component: PaymentsListPage },
              {
                path: ':id',
                Component: PaymentDetailPage,
                handle: meta({ title: 'Ödeme Detayı', permission: 'payment.refund', aiEntity: 'payment' }),
              },
            ],
          },
        ],
      },
      {
        path: 'messages',
        handle: meta({ title: 'Mesajlar & Şikayetler', permission: 'message.moderate', aiEntity: 'message' }),
        children: [
          { index: true, Component: ReportsListPage },
          {
            path: ':id',
            Component: ReportDetailPage,
            handle: meta({ title: 'Şikayet Detayı', permission: 'message.moderate', aiEntity: 'message' }),
          },
        ],
      },
      {
        path: 'reports',
        Component: ReportsPage,
        handle: meta({ title: 'Raporlar & Analitik', permission: 'report.view', aiEntity: 'report' }),
      },
      {
        path: 'audit',
        Component: AuditListPage,
        handle: meta({ title: 'Denetim Kaydı', permission: 'audit.view', aiEntity: 'audit' }),
      },
      {
        path: 'rbac',
        Component: RbacPage,
        handle: meta({ title: 'Roller & İzinler', permission: 'rbac.manage', aiEntity: 'rbac' }),
      },
      {
        path: 'settings',
        Component: () => <PlaceholderPage title="Ayarlar" />,
        handle: meta({ title: 'Ayarlar', permission: 'settings.manage', aiEntity: 'settings' }),
      },
      { path: '*', Component: () => <PlaceholderPage title="Sayfa bulunamadı" description="Aradığınız sayfa mevcut değil." /> },
    ],
  },
]);
