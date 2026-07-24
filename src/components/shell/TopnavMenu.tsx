import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, MoreHorizontal } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import type { NavItem } from '@/config/nav-schema';
import { isNavItemActive } from './nav-utils';

const MORE_RESERVED_PX = 120;

/** Horizontal nav with priority-plus overflow into a "More" menu. */
export function TopnavMenu({ items }: { items: NavItem[] }) {
  const { pathname } = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(items.length);

  const recompute = useCallback(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;
    const available = container.clientWidth;
    const children = Array.from(measure.children) as HTMLElement[];
    let used = 0;
    let count = 0;
    for (const child of children) {
      used += child.offsetWidth;
      if (used <= available - MORE_RESERVED_PX) count += 1;
      else break;
    }
    setVisibleCount(Math.max(1, Math.min(items.length, count)));
  }, [items.length]);

  useLayoutEffect(() => {
    recompute();
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(recompute);
    ro.observe(container);
    return () => ro.disconnect();
  }, [recompute]);

  const visible = items.slice(0, visibleCount);
  const overflow = items.slice(visibleCount);

  return (
    <div ref={containerRef} className="relative flex min-w-0 flex-1 items-center gap-1">
      {/* Hidden measurement row (all items) */}
      <div ref={measureRef} aria-hidden className="pointer-events-none invisible absolute left-0 top-0 flex">
        {items.map((item) => (
          <span key={item.id} className="flex h-9 items-center gap-2 px-3 text-sm font-medium">
            <item.icon className="size-4" />
            {item.label}
          </span>
        ))}
      </div>

      {visible.map((item) => (
        <TopnavLink key={item.id} item={item} active={isNavItemActive(item.to, pathname)} />
      ))}

      {overflow.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1" data-action="open-nav-overflow" data-entity="navigation">
              <MoreHorizontal className="size-4" />
              Daha fazla
              <ChevronDown className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {overflow.map((item) => (
              <div key={item.id}>
                <DropdownMenuItem asChild>
                  <NavLink to={item.to} end={item.to === '/'} data-action="navigate" data-entity={item.aiEntity ?? 'module'}>
                    <item.icon className="size-4" />
                    {item.label}
                  </NavLink>
                </DropdownMenuItem>
                {item.children?.length ? (
                  <>
                    {item.children.map((child) => (
                      <DropdownMenuItem key={child.id} asChild className="pl-8">
                        <NavLink to={child.to} data-action="navigate" data-entity={child.aiEntity ?? 'module'}>
                          {child.label}
                        </NavLink>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                  </>
                ) : null}
              </div>
            ))}
            <DropdownMenuLabel className="text-[0.6875rem]">
              Tüm modüller ⌘K ile de aranabilir
            </DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

function TopnavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn('gap-2 whitespace-nowrap', active && 'bg-accent text-accent-foreground')}
            data-action="open-nav-group"
            data-entity={item.aiEntity ?? 'module'}
          >
            <Icon className="size-4" />
            {item.label}
            <ChevronDown className="size-3.5 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuItem asChild>
            <NavLink to={item.to} end={item.to === '/'} data-action="navigate" data-entity={item.aiEntity ?? 'module'}>
              <Icon className="size-4" />
              {item.label}
            </NavLink>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {item.children!.map((child) => (
            <DropdownMenuItem key={child.id} asChild>
              <NavLink to={child.to} data-action="navigate" data-entity={child.aiEntity ?? 'module'}>
                <child.icon className="size-4" />
                {child.label}
              </NavLink>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      asChild
      variant="ghost"
      size="sm"
      className={cn('gap-2 whitespace-nowrap', active && 'bg-accent text-accent-foreground')}
    >
      <NavLink to={item.to} end={item.to === '/'} data-action="navigate" data-entity={item.aiEntity ?? 'module'}>
        <Icon className="size-4" />
        {item.label}
      </NavLink>
    </Button>
  );
}
