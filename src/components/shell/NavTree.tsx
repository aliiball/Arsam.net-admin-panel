import { NavLink, useLocation } from 'react-router-dom';

import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { NavItem } from '@/config/nav-schema';
import { isNavItemActive } from './nav-utils';

export interface NavTreeProps {
  items: NavItem[];
  /** Collapsed sidebar: icon-only with tooltips. */
  collapsed?: boolean;
  /** Called after navigating (e.g., close the mobile drawer). */
  onNavigate?: () => void;
}

/** Vertical navigation tree shared by the sidebar and the mobile drawer. */
export function NavTree({ items, collapsed = false, onNavigate }: NavTreeProps) {
  const { pathname } = useLocation();
  return (
    <nav className="flex flex-col gap-1" aria-label="Ana gezinme">
      {items.map((item) => (
        <NavGroup key={item.id} item={item} collapsed={collapsed} pathname={pathname} onNavigate={onNavigate} />
      ))}
    </nav>
  );
}

function NavGroup({
  item,
  collapsed,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  pathname: string;
  onNavigate: (() => void) | undefined;
}) {
  const hasChildren = !collapsed && item.children && item.children.length > 0;
  return (
    <div>
      <NavRow item={item} collapsed={collapsed} pathname={pathname} onNavigate={onNavigate} />
      {hasChildren && (
        <div className="mt-1 flex flex-col gap-0.5 border-l border-sidebar-border pl-3 ml-4">
          {item.children!.map((child) => (
            <NavRow
              key={child.id}
              item={child}
              collapsed={false}
              pathname={pathname}
              onNavigate={onNavigate}
              nested
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NavRow({
  item,
  collapsed,
  pathname,
  onNavigate,
  nested = false,
}: {
  item: NavItem;
  collapsed: boolean;
  pathname: string;
  onNavigate: (() => void) | undefined;
  nested?: boolean;
}) {
  const active = isNavItemActive(item.to, pathname);
  const Icon = item.icon;
  const link = (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      data-action="navigate"
      data-entity={item.aiEntity ?? 'module'}
      className={cn(
        'group flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium outline-none transition-colors',
        'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        'focus-visible:ring-2 focus-visible:ring-sidebar-ring',
        active && 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground',
        collapsed && 'justify-center px-0',
        nested && 'h-9 text-[0.8125rem] font-normal',
      )}
    >
      <Icon className={cn('size-4 shrink-0', nested && 'size-3.5')} aria-hidden="true" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </NavLink>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    );
  }
  return link;
}
