import { LogOut, UserCog } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSession } from '@/lib/permissions/permission-context';
import { ROLE_LABELS, ROLES, type Role } from '@/lib/permissions/permissions';

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/** Current-user menu. Includes a dev role switcher to preview RBAC gating. */
export function UserMenu() {
  const { user, setRole } = useSession();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label="Kullanıcı menüsü"
          data-action="open-user-menu"
          data-entity="user"
        >
          <Avatar className="size-8">
            <AvatarFallback>{initials(user.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">{user.name}</span>
            <span className="text-xs text-muted-foreground">{ROLE_LABELS[user.role]}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="flex items-center gap-2">
          <UserCog className="size-3.5" /> Rol (önizleme)
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup value={user.role} onValueChange={(v) => setRole(v as Role)}>
          {ROLES.map((role) => (
            <DropdownMenuRadioItem
              key={role}
              value={role}
              data-action="set-role"
              data-entity="user"
            >
              {ROLE_LABELS[role]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem data-action="sign-out" data-entity="user">
            <LogOut className="size-4" /> Çıkış yap
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
