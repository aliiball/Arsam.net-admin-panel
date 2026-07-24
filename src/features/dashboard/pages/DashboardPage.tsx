import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
import {
  Building2,
  CheckCircle2,
  Clock,
  FolderTree,
  MapPin,
  Plus,
  ScrollText,
  XCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KpiCard } from '@/components/data/KpiCard';
import { ChartCard } from '@/components/data/ChartCard';
import { EmptyState } from '@/components/feedback/EmptyState';
import { getAuditLog } from '@/lib/audit';
import type { TableQuery } from '@/components/data-table/types';
import { CATEGORY_LABELS, LOCATIONS } from '@/features/listings/data/taxonomy';
import { useListings } from '@/features/listings/api/queries';
import { AiSuggestionBadge } from '@/features/listings/components/AiSuggestionBadge';
import { useDashboardStats } from '../api/queries';

const PENDING_QUERY: TableQuery = {
  page: 1,
  pageSize: 5,
  sort: [{ id: 'createdAt', desc: true }],
  filters: { status: 'pending' },
  q: '',
};

export function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();
  const pendingQuery = useMemo(() => PENDING_QUERY, []);
  const { data: pending } = useListings(pendingQuery);
  const audit = getAuditLog().slice(0, 6);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Genel Bakış</h1>
          <p className="text-muted-foreground text-sm">Pazaryerinin anlık durumu ve bekleyen işler.</p>
        </div>
        <Button asChild>
          <Link to="/listings/create" data-action="create" data-entity="listing">
            <Plus className="size-4" /> Yeni ilan
          </Link>
        </Button>
      </header>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Toplam İlan" value={stats?.totalListings ?? 0} icon={Building2} loading={isLoading} hint="tüm kategoriler" />
        <KpiCard label="Bekleyen Moderasyon" value={stats?.pending ?? 0} icon={Clock} loading={isLoading} delta={-8} hint="son 7 gün" />
        <KpiCard label="Yayında" value={stats?.active ?? 0} icon={CheckCircle2} loading={isLoading} delta={12} hint="son 7 gün" />
        <KpiCard label="Reddedilen" value={stats?.rejected ?? 0} icon={XCircle} loading={isLoading} hint="toplam" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Category chart */}
        <ChartCard
          className="lg:col-span-2"
          title="Kategoriye göre ilanlar"
          description="Aktif taksonomi dağılımı"
        >
          <BarChart data={stats?.byCategory ?? []} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              cursor={{ fill: 'var(--muted)' }}
              contentStyle={{
                background: 'var(--popover)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--popover-foreground)',
                fontSize: 12,
              }}
            />
            <Bar dataKey="count" name="İlan" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>

        {/* Recent moderation decisions (audit) */}
        <Card className="gap-3">
          <CardHeader>
            <CardTitle className="text-base">Son moderasyon kararları</CardTitle>
            <CardDescription>Denetim kaydından</CardDescription>
          </CardHeader>
          <CardContent>
            {audit.length === 0 ? (
              <p className="text-muted-foreground py-6 text-center text-sm">
                Henüz karar yok. Moderasyon kuyruğundan başlayın.
              </p>
            ) : (
              <ol className="space-y-2 text-sm">
                {audit.map((entry) => (
                  <li key={entry.id} className="flex items-center gap-2">
                    <ScrollText className="text-muted-foreground size-3.5 shrink-0" />
                    <span className="truncate">
                      <span className="font-medium">{entry.action}</span>{' '}
                      <span className="text-muted-foreground">{entry.resource}</span>
                    </span>
                    <span className="text-muted-foreground ml-auto font-mono text-xs">{entry.ts.slice(0, 10)}</span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Pending queue preview */}
        <Card className="gap-3 lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Bekleyen ilanlar</CardTitle>
              <CardDescription>Moderasyon gerektiren son ilanlar</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/listings/moderation" data-action="navigate" data-entity="listing">
                Kuyruğa git
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {!pending || pending.items.length === 0 ? (
              <EmptyState title="Bekleyen ilan yok" description="Tüm ilanlar değerlendirildi." />
            ) : (
              <ul className="divide-border divide-y">
                {pending.items.map((listing) => (
                  <li key={listing.id} className="flex items-center gap-3 py-2">
                    <Link to={`/listings/${listing.id}`} className="min-w-0 flex-1 truncate font-medium hover:underline" data-action="open-detail" data-entity="listing">
                      {listing.title}
                    </Link>
                    <span className="text-muted-foreground hidden text-sm sm:inline">
                      {CATEGORY_LABELS[listing.category]} · {LOCATIONS[listing.il]?.label}
                    </span>
                    <AiSuggestionBadge suggestion={listing.aiSuggestion} reasons={listing.aiReasons} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Quick links */}
        <Card className="gap-3">
          <CardHeader>
            <CardTitle className="text-base">Hızlı erişim</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {[
              { to: '/listings', label: 'İlanlar', icon: Building2 },
              { to: '/listings/moderation', label: 'Moderasyon', icon: Clock },
              { to: '/categories', label: 'Kategoriler', icon: FolderTree },
              { to: '/locations', label: 'Lokasyonlar', icon: MapPin },
            ].map((q) => (
              <Button key={q.to} asChild variant="outline" className="h-auto justify-start gap-2 py-2">
                <Link to={q.to} data-action="navigate" data-entity="module">
                  <q.icon className="size-4" />
                  {q.label}
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
