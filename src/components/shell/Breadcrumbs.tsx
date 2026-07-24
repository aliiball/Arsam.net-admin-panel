import { Fragment } from 'react';
import { Link, useMatches } from 'react-router-dom';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { hasRouteMeta } from '@/app/route-meta';

interface Crumb {
  title: string;
  to: string;
}

/** Breadcrumb trail derived from matched routes' `handle.routeMeta.title`. */
export function Breadcrumbs() {
  const matches = useMatches();
  const crumbs: Crumb[] = matches
    .filter((m) => hasRouteMeta(m.handle))
    .map((m) => ({
      title: (m.handle as { routeMeta: { title: string } }).routeMeta.title,
      to: m.pathname,
    }));

  if (crumbs.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <Fragment key={crumb.to}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.to}>{crumb.title}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
