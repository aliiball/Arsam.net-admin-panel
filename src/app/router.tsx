import { createBrowserRouter } from 'react-router-dom';

import { AppShell } from '@/components/shell/AppShell';
import { DashboardPage } from '@/features/dashboard';
import {
  ListingsListPage,
  ListingDetailPage,
  ListingCreatePage,
  ModerationQueuePage,
} from '@/features/listings';
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
          { index: true, Component: () => <PlaceholderPage title="Kullanıcılar" /> },
          {
            path: 'agents',
            Component: () => <PlaceholderPage title="Emlak Ofisleri" />,
            handle: meta({ title: 'Emlak Ofisleri', permission: 'agent.verify', aiEntity: 'agent' }),
          },
        ],
      },
      {
        path: 'categories',
        Component: () => <PlaceholderPage title="Kategoriler & Nitelikler" />,
        handle: meta({ title: 'Kategoriler & Nitelikler', permission: 'category.manage', aiEntity: 'category' }),
      },
      {
        path: 'locations',
        Component: () => <PlaceholderPage title="Lokasyonlar" />,
        handle: meta({ title: 'Lokasyonlar', permission: 'location.manage', aiEntity: 'location' }),
      },
      {
        path: 'promotions',
        handle: meta({ title: 'Doping & Ödemeler', permission: 'promotion.sell', aiEntity: 'promotion' }),
        children: [
          { index: true, Component: () => <PlaceholderPage title="Doping Paketleri" /> },
          {
            path: 'payments',
            Component: () => <PlaceholderPage title="Ödemeler & Faturalar" />,
            handle: meta({ title: 'Ödemeler & Faturalar', permission: 'payment.refund', aiEntity: 'payment' }),
          },
        ],
      },
      {
        path: 'messages',
        Component: () => <PlaceholderPage title="Mesajlar & Şikayetler" />,
        handle: meta({ title: 'Mesajlar & Şikayetler', permission: 'message.moderate', aiEntity: 'message' }),
      },
      {
        path: 'reports',
        Component: () => <PlaceholderPage title="Raporlar & Analitik" />,
        handle: meta({ title: 'Raporlar & Analitik', permission: 'report.view', aiEntity: 'report' }),
      },
      {
        path: 'audit',
        Component: () => <PlaceholderPage title="Denetim Kaydı" />,
        handle: meta({ title: 'Denetim Kaydı', permission: 'audit.view', aiEntity: 'audit' }),
      },
      {
        path: 'rbac',
        Component: () => <PlaceholderPage title="Roller & İzinler" />,
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
