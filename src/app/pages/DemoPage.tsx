import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api/client';
import type { Paginated } from '@/lib/api/types';
import type { PingItem } from '@/lib/msw/handlers';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

/** Foundation smoke page: proves theming + TanStack Query + MSW contract wiring. */
export function DemoPage() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['ping', { page: 1, pageSize: 5 }],
    queryFn: () =>
      api.get<Paginated<PingItem>>(
        '/ping',
        new URLSearchParams({ page: '1', pageSize: '5' }),
      ),
  });

  return (
    <main className="mx-auto flex min-h-svh max-w-3xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">arsam.net — Yönetim Paneli</h1>
        <p className="text-muted-foreground">
          Temel iskelet çalışıyor: tasarım tokenları, TanStack Query ve MSW mock katmanı.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Mock veri (resource contract)</CardTitle>
          <CardDescription>
            <code className="font-mono">GET /api/ping?page&amp;pageSize</code> →{' '}
            <code className="font-mono">{'{ items, total, page, pageSize }'}</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {isLoading ? (
            <p className="text-muted-foreground text-sm" data-testid="demo-loading">
              Yükleniyor…
            </p>
          ) : isError ? (
            <p className="text-destructive text-sm" data-testid="demo-error">
              Veri alınamadı.
            </p>
          ) : (
            <ul className="flex flex-col gap-1" data-testid="demo-list">
              {data?.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                >
                  <span>{item.label}</span>
                  <span className="tabular-nums text-muted-foreground">{item.value}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-center gap-3">
            <Button
              onClick={() => void refetch()}
              loading={isFetching}
              data-action="refresh"
              data-entity="demo"
            >
              Yenile
            </Button>
            <span className="text-muted-foreground text-sm">
              Toplam: <span className="tabular-nums">{data?.total ?? 0}</span>
            </span>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
