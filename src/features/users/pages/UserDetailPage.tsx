import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Can } from '@/lib/permissions/permission-context';
import { getAuditFor } from '@/lib/audit';
import { LOCATIONS } from '@/features/listings/data/taxonomy';
import { USER_TYPE_LABELS } from '../data/users';
import { useUser } from '../api/queries';
import { useUserAction } from '../api/mutations';
import { UserStatusBadge } from '../components/UserStatusBadge';
import { TrustScoreMeter } from '../components/TrustScoreMeter';
import { VerificationBadges } from '../components/VerificationBadges';
import { UserActionDialog } from '../components/UserActionDialog';

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: user, isLoading, isError, refetch } = useUser(id);
  const act = useUserAction(id ?? '');

  if (isLoading) return <LoadingState label="Kullanıcı yükleniyor…" />;
  if (isError || !user) return <ErrorState title="Kullanıcı bulunamadı" onRetry={() => void refetch()} />;

  const audit = getAuditFor(`user:${user.id}`);
  const banned = user.status === 'banned' || user.status === 'suspended';

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to="/users" data-action="navigate" data-entity="user">
            <ArrowLeft className="size-4" /> Kullanıcılar
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-xl">{user.name}</CardTitle>
              <CardDescription>
                {USER_TYPE_LABELS[user.type]} · {user.email} · {user.phone}
              </CardDescription>
            </div>
            <UserStatusBadge status={user.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <TrustScoreMeter score={user.trustScore} />
            <div className="space-y-1">
              <span className="text-muted-foreground text-xs">Doğrulama</span>
              <VerificationBadges verification={user.verification} />
            </div>
          </div>

          <Separator />
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
            <Field label="Şehir" value={LOCATIONS[user.il]?.label} />
            <Field label="İlan Sayısı" value={String(user.listingsCount)} />
            <Field label="Kayıt Tarihi" value={new Date(user.joinedAt).toLocaleDateString('tr-TR')} />
            <Field label="Son Aktiflik" value={new Date(user.lastActiveAt).toLocaleDateString('tr-TR')} />
            {user.officeName && <Field label="Bağlı Ofis" value={user.officeName} />}
          </dl>
        </CardContent>
      </Card>

      {user.office && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ofis Bilgileri</CardTitle>
            <CardDescription>Bağlı emlak ofisi ve üye danışmanlar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
              <Field label="Unvan" value={user.office.title} />
              <Field label="Vergi No" value={user.office.taxId} />
              <Field
                label="Konum"
                value={`${LOCATIONS[user.office.il]?.districts[user.office.ilce]?.label ?? user.office.ilce}, ${LOCATIONS[user.office.il]?.label ?? user.office.il}`}
              />
            </dl>
            <div>
              <span className="text-muted-foreground text-xs">Üye Danışmanlar</span>
              <ul className="mt-1 flex flex-wrap gap-2">
                {user.office.memberAgents.map((agent) => (
                  <li key={agent} className="bg-muted rounded-md px-2 py-0.5 text-sm">
                    {agent}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Doğrulama &amp; Moderasyon</CardTitle>
          <CardDescription>AI önerir, siz karar verirsiniz. Her karar denetim kaydına yazılır.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Kullanıcı moderasyon kararı">
            <Can permission="user.verify">
              <Button
                onClick={() => act.mutate({ action: 'verify' })}
                loading={act.isPending}
                data-action="verify"
                data-entity="user"
              >
                <Check className="size-4" /> Doğrula
              </Button>
            </Can>
            <Can permission="user.suspend">
              <UserActionDialog action="suspend" onConfirm={async (input) => { await act.mutateAsync(input); }} />
            </Can>
            <Can permission="user.ban">
              <UserActionDialog action="ban" onConfirm={async (input) => { await act.mutateAsync(input); }} />
            </Can>
            {banned && (
              <Can permission="user.unban">
                <UserActionDialog action="unban" onConfirm={async (input) => { await act.mutateAsync(input); }} />
              </Can>
            )}
          </div>

          {audit.length > 0 && (
            <>
              <Separator />
              <ol className="space-y-2 text-sm">
                {audit.map((entry) => (
                  <li key={entry.id} className="flex items-start gap-2">
                    <span className="text-muted-foreground font-mono text-xs">{entry.ts.slice(0, 10)}</span>
                    <span>
                      <span className="font-medium">{entry.action}</span> — {entry.actor}
                    </span>
                  </li>
                ))}
              </ol>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | undefined }) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="tabular-nums">{value ?? '—'}</dd>
    </div>
  );
}
