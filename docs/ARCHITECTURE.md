# Architecture

## Folder structure (feature-based)
```
src/
  app/                 # router, providers, root layout
    router.tsx         # createBrowserRouter (DATA mode)
    providers.tsx      # QueryClientProvider, ThemeProvider, LayoutProvider, Toaster
  components/          # shared UI (shell, primitives, data-table, forms)
    shell/             # AppShell, Sidebar, Topbar, MobileNav, CommandPalette, LayoutSwitcher
    ui/                # shadcn/ui primitives (new-york)
    data-table/        # DataTable + FilterBar + toolbar
    form/              # FormField, FieldHelp, FormSection, Wizard
  features/            # domain modules (listings, users, ...)
  lib/                 # cn(), api client, msw, utils, permissions
  config/
    nav-schema.ts      # SINGLE source of truth for navigation
    layout.ts          # layout config contract + persistence
  styles/
    theme.css          # @theme tokens (light + dark)
  types/
  main.tsx
```

## Routing — React Router v7 DATA mode ONLY
- `createBrowserRouter([...])` + `<RouterProvider>`. NO framework mode, NO SSR/RSC, NO Next.js.
- Routes are objects with `path`, `Component`, optional `loader`/`action`, and a custom `handle.routeMeta` (`{ title, permission, aiEntity }`).
- Route guards read the current role -> redirect/403 when `routeMeta.permission` fails.

## Layout config system (single nav schema -> two shells)
```ts
// config/layout.ts
export type LayoutMode = 'sidebar' | 'topnav';
export interface LayoutConfig {
  mode: LayoutMode;
  sidebarCollapsed: boolean;   // sidebar mode only
  density: 'comfortable' | 'compact';
  theme: 'light' | 'dark' | 'system';
}
export const DEFAULT_LAYOUT: LayoutConfig = {
  mode: 'sidebar', sidebarCollapsed: false, density: 'comfortable', theme: 'system',
};
// Persistence: localStorage key `arsam.layout` now; swap to API later behind the same interface.
```
```ts
// config/nav-schema.ts — ONE source of truth, rendered by BOTH shells
export interface NavItem {
  id: string;
  label: string;                 // English label; Turkish domain terms allowed inline
  icon: LucideIcon;
  to: string;
  permission?: string;           // resource.action
  children?: NavItem[];          // groups (sidebar sections / topnav mega-menu)
  aiEntity?: string;             // for AI copilot
}
export const navSchema: NavItem[] = [ /* listings, users, categories, ... */ ];
```
- `LayoutProvider` exposes `{ config, setMode, toggleSidebar, setDensity }`; persists on change; switches WITHOUT reload.
- `AppShell` renders `<SidebarShell>` or `<TopnavShell>` based on `config.mode`; both consume `navSchema`.
- **topnav mode:** horizontal nav shows what fits; overflow collapses into a "More" menu / mega-menu; command palette (Cmd/Ctrl-K) gives equivalent access to every module.
- **mobile (both modes):** converge to a drawer + bottom navigation (<=5 primary items) + command palette.

## State strategy
- **Server state:** TanStack Query v5 (queries/mutations, cache, optimistic updates).
- **URL state:** table/filter/pagination/sort state synced to the query string (source of truth for lists).
- **Local UI state:** React state / small context (layout, theme, density).
- **Form state:** React Hook Form + Zod (`zodResolver`).
- **Transitions:** `useOptimistic` / `useTransition` for snappy mutations.

## API layer + MSW
- Thin fetch client in `lib/api`. Resource contract: `GET /{resource}?page&pageSize&sort&filters` -> `{ items, total, page, pageSize }`.
- MSW mocks now (per-feature `handlers.ts` registered on one server); FastAPI REST later behind the same client interface. `VITE_API_BASE_URL` selects the base.

## TypeScript strictness
`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`. Types derive from Zod schemas via `z.infer`. No `any`/`@ts-ignore`.
