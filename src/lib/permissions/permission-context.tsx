import * as React from 'react';

import { can, type Permission, type Role } from './permissions';

export interface SessionUser {
  id: string;
  name: string;
  role: Role;
}

export interface SessionContextValue {
  user: SessionUser;
  setRole: (role: Role) => void;
}

/** Mock signed-in user until real auth lands. */
const DEFAULT_USER: SessionUser = {
  id: 'u-1',
  name: 'Ahmet Yönetici',
  role: 'super-admin',
};

const SessionContext = React.createContext<SessionContextValue | null>(null);

export interface SessionProviderProps {
  children: React.ReactNode;
  initialUser?: Partial<SessionUser>;
}

export function SessionProvider({ children, initialUser }: SessionProviderProps) {
  const [user, setUser] = React.useState<SessionUser>({ ...DEFAULT_USER, ...initialUser });
  const value = React.useMemo<SessionContextValue>(
    () => ({ user, setRole: (role) => setUser((u) => ({ ...u, role })) }),
    [user],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = React.useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within a SessionProvider');
  return ctx;
}

/** Returns whether the current user holds a permission (or a predicate helper). */
export function usePermission(permission?: Permission): boolean {
  const { user } = useSession();
  if (!permission) return true;
  return can(user.role, permission);
}

export interface CanProps {
  permission: Permission;
  children: React.ReactNode;
  /** Rendered when the permission is absent (default: nothing). */
  fallback?: React.ReactNode;
}

/** Conditionally renders children when the current user has `permission`. */
export function Can({ permission, children, fallback = null }: CanProps) {
  const allowed = usePermission(permission);
  return <>{allowed ? children : fallback}</>;
}
