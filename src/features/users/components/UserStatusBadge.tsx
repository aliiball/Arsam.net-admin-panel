import { Badge } from '@/components/ui/badge';
import { USER_STATUS_LABELS, type UserStatus } from '../data/users';

const VARIANT: Record<UserStatus, React.ComponentProps<typeof Badge>['variant']> = {
  active: 'success',
  pending: 'warning',
  suspended: 'secondary',
  banned: 'destructive',
};

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return <Badge variant={VARIANT[status]}>{USER_STATUS_LABELS[status]}</Badge>;
}
