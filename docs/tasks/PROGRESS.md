# Marathon Progress Log

In MARATHON mode, Claude appends ONE checkpoint entry per completed task below.
Never delete past entries; this file is the recovery point if the session is
interrupted (resume with: "read docs/tasks/PROGRESS.md and CURRENT.md, continue
MARATHON mode from where it left off").

Entry format:

## [date/time] Task NNN — <name>
- Built: <summary of what was implemented>
- Verification: lint PASS/FAIL · typecheck PASS/FAIL · test PASS/FAIL · build PASS/FAIL
- Decisions/assumptions: <anything decided autonomously>
- Suggested commit message: <english conventional commit>

---

## 2026-07-24 Task 000 — Foundation
- Built: Vite 8 + React 19 + TS (strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes,
  erasableSyntaxOnly, verbatimModuleSyntax) SPA scaffold with `@/*` alias. Tailwind v4 CSS-first
  `src/styles/theme.css` — DESIGN_SYSTEM.md OKLCH tokens copied EXACTLY (:root + .dark) + `@theme inline`
  mapping (colors, radii, type scale, shadows, motion, fonts) + base layer (tabular-nums, reduced-motion).
  Self-hosted variable fonts (Geist/Geist Mono/Inter via @fontsource-variable). shadcn new-york-style
  Button (with `loading`) + Card hand-authored (token-only, cva, data-slot). React Router v7 DATA mode
  (`createBrowserRouter`) with root layout + demo index route carrying `handle.routeMeta`. Providers:
  QueryClient + SessionProvider(RBAC) + LayoutProvider(theme+density+mode, localStorage `arsam.layout`)
  + sonner Toaster. RBAC model (matrix/can/Can/usePermission) + api client (resource contract) + MSW
  (browser worker + node server + demo `/ping` handler). Storybook 10 (react-vite) with addon-a11y +
  addon-vitest + addon-docs, mobile viewports (360/414), theme+layout toolbars. Vitest 4 two-project
  config: `unit` (jsdom + Node MSW) and `storybook` (real Chromium via @vitest/browser-playwright).
  Button/Card full-DoD stories (Default/Loading/Empty/Error/Mobile + play) + MSW contract unit test.
- Verification: lint PASS (0 errors; 6 react-refresh warnings — standard for shadcn/context files) ·
  typecheck PASS · test PASS (15/15 across unit + browser-based Storybook play/a11y) · build PASS ·
  build-storybook PASS · dev server serves `#root`.
- Decisions/assumptions:
  - TypeScript pinned to ~5.9 (TS 7 is out but typescript-eslint requires <6.1). Recorded as a known
    upgrade item once the ESLint toolchain supports TS 7.
  - shadcn components hand-authored in new-york style instead of `npx shadcn init` (CLI is interactive
    and brittle against Tailwind v4 + hand-configured project). `components.json` present so the CLI can
    still be used later. Functionally equivalent, token-only output.
  - Vitest 4 moved browser providers to separate packages → added `@vitest/browser-playwright`; provider
    is `playwright()` (object), not the old `'playwright'` string.
  - ui/ primitives live flat in `src/components/ui/*.tsx` with co-located `*.stories.tsx` (shadcn idiom);
    custom component groups (shell/feedback/form/data-table/features) will use PascalCase folders per the
    create-component skill.
  - Local Node is v25.8.1; CI targets Node 22. Toolchain works on both; no code depends on v25.
  - Fonts self-hosted (offline; curl/wget denied). `system` theme resolves live via matchMedia.
- Suggested commit message:
  `chore(foundation): scaffold Vite+React19+TS, Calm Signal tokens, RR data-mode, Storybook 10, MSW`

## 2026-07-24 Task 001 — AppShell + Layout Modes
- Built: Single `config/nav-schema.ts` (10 modules + children + permission + aiEntity + `primary` for
  bottom nav) driving BOTH shells. `LayoutProvider` (from Task 000) drives mode/density/theme with
  localStorage persistence and reload-less switching; density scales the root em via `[data-density]`.
  Shell: `AppShell` (mode-switch orchestrator + CommandPaletteProvider + MobileBottomNav + CommandPalette),
  `SidebarShell` (collapsible aside, lg+), `TopnavShell` (horizontal nav), `TopnavMenu` (measured
  priority-plus overflow into a "More" menu via ResizeObserver), `Topbar` + `TopbarActions` (breadcrumbs,
  ⌘K search trigger, Density/Layout/Theme toggles, UserMenu), `CommandPalette` (⌘K, every permitted
  module + quick actions), `MobileDrawer` + `MobileBottomNav` (drawer + ≤5 bottom items, both modes
  converge below lg), `NavTree` (shared vertical nav, collapsed tooltips), `Breadcrumbs` (from
  `handle.routeMeta`), `Brand`, `ThemeToggle`, `DensityToggle`, `LayoutSwitcher`, `UserMenu` (with dev
  role switcher to preview RBAC gating). Permission-aware nav via `usePermittedNav`/`filterNavByRole`.
  Router now roots at `AppShell` with placeholder pages for all 10 modules (nested routes + routeMeta).
  Added primitives needed by the shell (count toward Task 002): tooltip, separator, avatar, scroll-area,
  dialog, sheet, dropdown-menu, command, breadcrumb. Full-DoD stories for every shell component
  (Sidebar/Topnav/Mobile + play + a11y) via a `shellRouterDecorator` (data-mode memory router) and
  `globals.layout` to force each mode.
- Verification: lint PASS (0 errors; react-refresh warnings only) · typecheck PASS · test PASS
  (102/102 across unit + browser Storybook play/a11y) · build PASS.
- Decisions/assumptions:
  - Custom collapsible sidebar instead of the heavy shadcn `sidebar` block — lighter, token-only,
    same behavior (collapsible + sections). Documented as equivalent.
  - topnav overflow is a real measured priority-plus (hidden measurement row + ResizeObserver), with a
    reserved width for the "More" trigger; command palette guarantees full module parity regardless.
  - Density is implemented as a root-em scale (comfortable 100% / compact 93.75%) applied on <html> —
    a real, global density change; component-level density can refine later (tables in Task 004).
  - Shell-needed primitives were authored here to unblock 001; their existence is noted so Task 002
    focuses on the remaining primitives + any missing story polish.
  - `UserMenu` includes a role switcher (dev-only affordance) so RBAC nav filtering is demoable now.
- Suggested commit message:
  `feat(shell): configurable AppShell with sidebar/topnav modes, command palette, mobile nav`

## 2026-07-24 Task 002 — Primitives & Feedback
- Built: Full P0 primitive set (new-york style, token-only, cva variants, data-slot). Created this task:
  Label, Input, Textarea, Badge, Skeleton, Spinner, Switch, Checkbox, RadioGroup, Slider, Select,
  Popover, Combobox (Popover+cmdk), Tabs, Accordion, Pagination. Created earlier for the shell (Task
  001) and inventoried here: Tooltip, Separator, Avatar, ScrollArea, Dialog, Sheet, DropdownMenu,
  Command, Breadcrumb (+ Button, Card from Task 000). Feedback set: EmptyState, ErrorState,
  LoadingState, InlineAlert (info/success/warning/destructive, icon+text so color is never the sole
  signal), ConfirmDialog (async confirm w/ spinner, destructive variant). Every primitive + feedback
  component ships full-DoD stories (Default/Loading/Empty/Error/Mobile + play + a11y). Added derived
  `--success-foreground` / `--warning-foreground` tokens (inverted per light/dark) so tinted
  success/warning surfaces meet WCAG contrast; added accordion open/close keyframes.
- Verification: lint PASS (0 errors; react-refresh warnings only) · typecheck PASS · test PASS
  (254/254 across unit + browser Storybook play/a11y) · build PASS.
- Decisions/assumptions:
  - Tooltip uses Radix content, NEVER the `title` attribute (hard rule).
  - Combobox is a composed primitive (Popover + Command) since shadcn ships it as a recipe, not a file.
  - Added `success-foreground`/`warning-foreground` semantic tokens (not in the original spec) purely to
    guarantee AA contrast on tinted status surfaces; values derive from the existing success/warning hues.
  - A first browser-test run showed transient "Failed to fetch dynamically imported module" errors from
    Vite dep pre-bundling when many new stories landed at once; a re-run (deps warm) is green. This is a
    known first-run optimizer race, not a story defect.
- Suggested commit message:
  `feat(ui): P0 primitives + feedback components with full Storybook coverage`

## 2026-07-24 Task 003 — Form System
- Built: `FieldHelp` (icon-only; help in a focus-managed Popover, warning in a Tooltip; 44px hit area via
  pseudo-element; NEVER the `title` attribute). `FormField` (RHF `useController`, clones element OR calls
  a render-fn child so custom controls like Select/Combobox bind; wires aria-invalid + aria-describedby to
  persistent help/warning/error nodes; DEV-throws when no help/helper/warning — proven by a jsdom unit
  test). `Form` (FormProvider alias), `FormSection`, `FormErrorSummary` (flattens nested RHF errors, anchor
  links focus+scroll to the field via stable name-derived ids). `Wizard` (per-step `form.trigger`
  validation gate, localStorage autosave, beforeunload dirty-warning, clickable stepper, review step).
  Specialized inputs: `Calendar` (react-day-picker, tr locale) + `DatePicker`, `RangeInput` (min/max with
  tr thousands separators + tabular-nums + unit suffix), `CascadingSelect` (il→ilçe→mahalle; child disabled
  until parent chosen, descendants reset on ancestor change). Full-DoD stories for every form component +
  a FormField enforcement unit test.
- Verification: lint PASS (0 errors; react-refresh warnings only) · typecheck PASS · test PASS
  (308/308 across unit + browser Storybook play/a11y) · build PASS.
- Decisions/assumptions:
  - FieldHelp help uses a click Popover (focus-managed, handles long content) plus a persistent sr-only
    node for aria-describedby; warning uses a Tooltip. Chose this over hover-tooltip-for-help to avoid
    stacking two overlays on one trigger while still meeting the focus-management DoD.
  - Story schemas validate numeric fields as strings (regex/refine) instead of `z.coerce.number()`:
    zod v4 `coerce` yields a transformed output type that clashes with RHF's resolver generics under
    `exactOptionalPropertyTypes`. Task 005 keeps numeric form fields as strings and parses at the submit
    boundary to stay compatible with the Wizard's `UseFormReturn<T>` prop.
  - Combobox now forwards `aria-label` so CascadingSelect levels have deterministic accessible names.
  - One full-suite run hit a ~one-time cold dep pre-bundle (react-day-picker/date-fns/zod-resolver newly
    imported by the browser project) that ran long; once warm the full suite is ~8s and green (308/308).
- Suggested commit message:
  `feat(form): FieldHelp-enforced FormField, wizard, error summary, cascading/range/date inputs`

## 2026-07-24 Task 004 — Data Table
- Built: `useTableUrlState` (URL = single source of truth for page/pageSize/sort/filters/view/q via
  `useSearchParams`; deep-linkable, back/forward). `DataTable` (TanStack Table v8, manual pagination/
  sorting/filtering; row selection + select-all-matching; expandable sub-rows; column visibility;
  column resizing; sticky header; TanStack Virtual row virtualization above 30 rows via the spacer-row
  technique keeping `<table>`/`role="grid"` semantics; loading/empty/error states; mobile card transform
  below `lg`). `FilterBar` (faceted filters with API counts + multi-select, number ranges via RangeInput,
  date ranges via DatePicker, filter chips with individual + clear-all, saved views in localStorage,
  natural-language box that proposes filters as chips for confirm-before-apply). `ColumnVisibility`,
  `BulkActionBar`, `ExportMenu` (CSV/Excel × view/selection/all), `DataTablePagination`. `lib/export.ts`
  (dependency-free CSV with BOM + Excel-compatible .xls). `useSavedViews`. Full-DoD stories with play
  tests for sort/filter/select/bulk/export across the suite.
- Verification: lint PASS (0 errors; react-refresh warnings only) · typecheck PASS · test PASS
  (347/347 across unit + browser Storybook play/a11y) · build PASS.
- Decisions/assumptions:
  - Contract point 4 (column controls): visibility + resizing are implemented; **column pinning and
    drag-reordering are deferred** — TanStack supports both (state hooks are in place) but the DnD/pinning
    UI is not built yet. Known gap to close in a follow-up; does not block the listings vertical slice.
  - Cascading il→ilçe→mahalle in filters is provided by the standalone `CascadingSelect` (Task 003) and is
    wired at the feature level (Task 005) rather than as a built-in FilterBar `kind`; FilterBar's
    declarative kinds are faceted/numberRange/dateRange/search + NL.
  - Excel export emits an HTML-table `.xls` (widely Excel-openable) to avoid a heavy SheetJS dependency;
    CSV is BOM-prefixed for correct Turkish characters.
  - Numeric columns sort descending on first click (TanStack `sortDescFirst` default) — reflected in tests.
  - Virtualization kicks in above 30 rows; smaller pages render normally.
- Suggested commit message:
  `feat(data-table): URL-synced DataTable with filters, bulk actions, export, virtualization`

## 2026-07-24 Task 005 — Listings Vertical Slice
- Built: `features/listings` end-to-end vs MSW. Zod-first schemas (`listingSchema` entity, `moderationSchema`,
  `listingFormSchema` with category-driven superRefine; numeric form fields kept as strings + `formToPayload`
  parse at submit). Taxonomy data (5 categories, 6 statuses, heating/deed/zoning enums, per-category
  attribute sets, cascading il→ilçe→mahalle). MSW handlers (list w/ filter/sort/paginate, detail, create,
  update, moderate) registered in the central registry; moderation writes an immutable audit entry
  (`lib/audit.ts`, actor supports `ai:<agent>`). Query/mutation hooks (`useListings` keepPreviousData,
  `useListing`, `useModerateListing` optimistic + rollback + sonner toasts, `useCreateListing`). Pages:
  List (DataTable + FilterBar with faceted status/category/il + price range + NL parser, export, bulk,
  expandable rows), Detail (attributes + AI badge + three-tier ModerationDecision + audit timeline),
  Create (4-step Wizard: basics → dynamic category attributes → cascading location → review, per-step
  validation + draft autosave), Moderation Queue (pending cards, inline OK/Uncertain/NOK). Feature
  components: ListingStatusBadge, AiSuggestionBadge (reasons on hover), ModerationDecision (Uncertain/NOK
  require a reason via focus-managed popover). Routes wired in data mode with `routeMeta` (list/create/
  moderation/detail); `navSchema` already exposes listings + moderation across sidebar/topnav/mobile.
  Permissions gated via `<Can>` + route permission meta. Full-DoD stories (components + all four pages via
  a seeded-QueryClient + memory-router harness) + a handlers/audit unit test proving moderation writes audit.
- Verification: lint PASS (0 errors; react-refresh warnings only) · typecheck PASS · test PASS
  (391/391 across unit + browser Storybook play/a11y) · build PASS · dev server serves `/` and `/listings`.
- Decisions/assumptions:
  - Numeric listing form fields are strings validated by regex/superRefine and converted to numbers in
    `formToPayload` at submit — keeps `useForm<ListingFormValues>` compatible with `Wizard`'s
    `UseFormReturn<T>` prop (avoids the zod-coerce transform-generics clash noted in Task 003).
  - The cascading location composite is rendered with an explicit `FieldHelp` affordance (not a single-name
    `FormField`) because it spans three fields; help requirement is still satisfied.
  - Page Storybook stories seed a `staleTime: Infinity` QueryClient with `setQueryData` + a memory router
    instead of running MSW inside Storybook — deterministic, no service-worker dependency in browser tests.
  - Moderation maps OK→active, Uncertain→pending(hold), NOK→rejected; audit action is
    `listing.approve|hold|reject` with before/after status + reason. AI proposes; human confirms (guardrail).
- Suggested commit message:
  `feat(listings): end-to-end vertical slice — list/detail/create-wizard/moderation vs MSW + audit`

## 2026-07-24 Final — whole-project DoD review + fixes
- Ran the `dod-reviewer` agent over the entire `src/` tree. Verdict was CONCERNS with 3 blocking gaps;
  all 3 fixed (+ 2 cheap a11y/UX improvements), then re-verified.
- Blocking fixes:
  1. FieldHelp bypass in the create-wizard Location step — extended `CascadingSelect` to accept
     `label`/`help`/`errors`, render a `FieldHelp` affordance, and thread `aria-describedby` (to the shared
     help + per-level error) and `aria-invalid` into every level's Combobox. `LocationStep` now uses it.
  2. Route-level RBAC was nav-only — added `RouteGuard` (reads matched `handle.routeMeta.permission` via
     `useMatches`, renders a 403 `ForbiddenPage` when the role lacks it), wired into `AppShell`, covered by
     a unit test (analyst → 403, super-admin → content).
  3. Export ignored scope/format — `ListingsListPage.onExport` now honors selection/all-matching (fetches
     all-matching for `all`), calls `exportXls` for the Excel format, and shows a sonner toast.
- Non-blocking improvements: `aria-live="polite"` on `BulkActionBar`; visible column-resize handle in
  `DataTable` headers (resizing flag was on but had no UI).
- Deferred (tracked, non-blocking): DataTable column pinning + drag-reordering; `window.prompt` for
  naming a saved view → replace with a themed Dialog; route-level code-splitting to shrink the 1.2MB
  main bundle; programmatic WCAG contrast checks + live a11y-addon report capture.
- Final verification: lint PASS (0 errors; 13 warnings) · typecheck PASS · test PASS (393/393, 72 files) ·
  build PASS · build-storybook PASS · dev server serves `/` and `/listings`.
- Suggested commit message:
  `fix(dod): route RBAC guard, wizard location FieldHelp/aria, export scope+xls, table a11y`

## 2026-07-24 Aşama 1 — Quick fixes + real Dashboard
- **Topnav overlap bug (görseldeki bozukluk) fixed:** `TopnavMenu` priority-plus measurement was inaccurate
  (ghost row didn't mirror the real buttons — missing the group chevron + inter-item gap) and the container
  had no overflow clip, so nav items visually overlapped the right-side actions cluster. Fix: ghost row now
  mirrors real button markup (icon + label + chevron for groups), the fit calc adds the `gap-1` (4px) and only
  reserves the "More" width while items still overflow, container is `overflow-hidden`, and the `TopbarActions`
  cluster is `shrink-0` so it can never be compressed/overlapped.
- **Real Dashboard replaces the demo ping page:** new `KpiCard` (tabular value + trend delta) and `ChartCard`
  (recharts `ResponsiveContainer`, chart-1..5 tokens) primitives; `GET /api/dashboard/stats` MSW endpoint
  computing live counts from the listings mock DB (via `getListingsSnapshot`); `useDashboardStats` hook;
  `features/dashboard/DashboardPage` = 4 KPI tiles + category bar chart + recent-decisions (audit) panel +
  pending-queue preview + quick links. Index route now renders DashboardPage (old `DemoPage`/`/ping` kept for
  the contract unit test). Full-DoD stories for KpiCard/ChartCard/DashboardPage.
- **FilterBar `window.prompt` → themed Dialog:** saving a view now opens a focus-managed `Dialog` with a
  labelled `Input` (Enter-to-save), replacing the native prompt (themeable, mobile-friendly, a11y-clean).
- Verification: lint PASS (0 errors; warnings only) · typecheck PASS · test PASS (409/409, 75 files) ·
  build PASS · dev serves `/` clean.
- Notes: bundle grew to ~1.59MB (recharts) — reinforces the deferred route-level `lazy()` code-split
  (Aşama 5). Recharts' first entry into the browser-test graph triggers the known one-time Vite dep
  pre-bundle reload; a warm re-run is green.
- Suggested commit message:
  `feat(dashboard): real dashboard (KPI + chart + stats); fix topnav overflow; FilterBar save-view dialog`

## 2026-07-24 Task 006 — Aşama 2: Harita & Dataviz Katmanı
- Built: `MapView` (`components/data`) — React Leaflet 5 + `leaflet.markercluster`. Token-styled pins
  (`L.divIcon`, `--color-primary`/`--color-chart-1`, no default-icon asset bug) + cluster badges via a
  custom `iconCreateFunction`; imperative `ClusterLayer` child (`useMap`) syncs markers into a
  `markerClusterGroup`, binds popups, fires `onMarkerClick`, and fit-bounds when no `center` is given.
  A11y: the map region is a labelled `role="region"` (aria-label lives on the wrapper `<div>` because
  react-leaflet swallows unknown props on `MapContainer`), plus an always-rendered `sr-only` marker list
  of focusable buttons (accessible alternative + keyboard) so the map is never the sole signal; Leaflet
  zoom controls bumped to 44px targets in `theme.css`. `DonutChartCard` — recharts `PieChart` donut with
  center total overlay + token-colored legend (label + value, color never the sole signal), chart-1..5
  tokens, empty-state branch. `features/listings/data/geo.ts` — approx il/ilçe centroids + deterministic
  `listingLatLng` (FNV-1a id hash → ±0.02° jitter) as PURE functions (unit-tested in jsdom). Integrations:
  `ListingDetailPage` gets a "Konum" single-marker map card (labelled "yaklaşık konum"); `DashboardPage`
  gets a `byStatus` donut (category bar chart narrowed from col-span-2 to a 3-up row). `theme.css` gained an
  unlayered Leaflet theming block (container/controls/popups → tokens). Full-DoD stories for MapView (+
  SingleMarker) and DonutChartCard (Default/Loading/Empty/Error/Mobile + play); DashboardPage story now
  seeds real `byStatus` and asserts the donut; geo unit test (determinism + jitter envelope + fallbacks).
- Verification: lint PASS (0 errors; 13 pre-existing warnings) · typecheck PASS · test PASS (425/425, 78
  files) · build PASS · build-storybook PASS.
- DoD self-check: ran the `dod-reviewer` agent → 3 blocking gaps, all FIXED before checkpoint:
  (1) `MapContainer aria-label` was swallowed by react-leaflet → moved `role="region"`+`aria-label` to the
  wrapper div; (2) Leaflet zoom buttons were 26px → 44px in `theme.css`; (3) `DashboardPage.Default` story
  demoed the donut with empty data → seeded `byStatus` + added a play assertion. Non-blocking items noted.
- Decisions/assumptions:
  - Coordinates are MOCK/approximate (il+ilçe centroids only, no backend geo) — `listingLatLng` jitters by
    a deterministic id hash so co-located listings don't stack on one pixel. Real coords arrive with FastAPI.
  - Leaflet markers/clusters are styled via inline `L.divIcon` HTML referencing CSS var tokens (the only
    way to token-style outside Tailwind's class layer); no hardcoded hex/rgb — shadows use `--shadow-md`.
  - No `mounted` client-guard: this is an SSR-free SPA and the Storybook browser project runs real Chromium,
    so `MapContainer` renders directly (removing it also cleared a lint "setState in effect" error).
  - OSM tiles are fetched live (unmocked) in stories/tests — acceptable now; flagged to mock + make the tile
    provider configurable when hardening (Aşama 5).
  - Stretch "listings map-view toggle" DEFERRED (not built) — detail-page + dashboard integration covers the
    acceptance criteria; revisit under Reports/Analytics (012) or polish (017).
  - Bundle grew to ~1.8MB (leaflet + markercluster) — reinforces deferred route-level `lazy()` (Aşama 5),
    with `MapView` a prime lazy-load candidate since it's only on the detail page.
- Suggested commit message:
  `feat(map): token-styled MapView (leaflet+markercluster) + DonutChartCard; wire detail map + dashboard donut`

## 2026-07-24 Task 007 — Kullanıcılar & Ofisler
- Built: `features/users` end-to-end vs MSW, following the listings vertical as a template. Zod-first schemas
  (`userSchema` entity with type/status/verification/trustScore/office, `officeSchema`, `userActionSchema`
  with reason-required refine, `reasonFormSchema` for the dialog) + PURE `computeTrustScore(user)` (baseline +
  weighted verification channels + activity, clamped by lifecycle status; banned→0). Taxonomy/labels
  (`data/users.ts`: types, statuses, verification levels/channels, action labels). MSW handlers (list with
  filter/sort/paginate over status/type/verification/il/trust-range, detail, single `POST /users/:id/action`
  covering verify/suspend/ban/unban) — action input is now runtime-validated via `userActionSchema.safeParse`
  (422 on failure) and every write emits an immutable `lib/audit` entry (`user.verify|suspend|ban|unban`,
  before/after status+verification+reason). Query/mutation hooks (`useUsers` keepPreviousData, `useUser`,
  `useUserAction` optimistic status flip + rollback + sonner toasts). Components: `UserStatusBadge`,
  `TrustScoreMeter` (0–100 `role="meter"` with aria-value*, numeric value + tier label so color is never the
  sole signal; compact variant for table cells), `VerificationBadges` (identity/office/phone; icon + label +
  `aria-label` carrying the level to assistive tech + tooltip), `UserActionDialog` (RHF + `FormField`/FieldHelp
  reason capture; suspend/ban require ≥5-char reason, unban optional), `userColumns`. Pages: List (DataTable +
  FilterBar with status/type/verification facets + trust numberRange + il + NL parser, bulk suspend/ban via the
  dialog, export CSV/XLS with scope), Detail (profile + TrustScoreMeter + VerificationBadges + office/agents
  card + three-tier Doğrula/Askıya-al/Yasakla + Yasağı-kaldır + audit timeline). Router: `/users` index →
  UsersListPage, `/users/:id` → UserDetailPage (routeMeta + permission). Permissions: added
  `user.suspend|ban|unban` to the `support` role (matrix + `docs/PERMISSIONS.md`), gated via `<Can>` + route
  meta. Full-DoD stories for every component + both pages (seeded-QueryClient + memory-router harness reused
  from listings `page-story-utils`) + a `computeTrustScore` + handlers-write-audit unit test.
- Verification: lint PASS (0 errors; 13 pre-existing warnings) · typecheck PASS · test PASS (470/470, 85
  files) · build PASS. Runtime-verified by driving the running dev app with Playwright: list renders 25 trust
  meters; deep-linked `?status=banned` and `?trustMin=70` filter correctly; detail page moderation group +
  meter present; suspend dialog blocks empty submit (guardrail), then on confirm flips status→Askıda,
  recomputes trust→35, writes `user.suspend` audit, shows unban button + success toast.
- DoD self-check: ran the `dod-reviewer` agent → 1 blocking a11y gap, FIXED before checkpoint:
  `VerificationBadges` conveyed the verification LEVEL only via aria-hidden icon + color + a keyboard-inaccessible
  tooltip → added `aria-label="{channel}: {level}"` on each Badge so the level reaches screen readers (color/icon
  never the sole signal); story now asserts the accessible name. Non-blocking items also applied:
  `docs/PERMISSIONS.md` synced with the new support permissions; `userActionSchema` is now actually used
  (server-side validation) instead of type-only. Deferred (inherited from listings template, non-blocking):
  page `Error` stories mirror `Empty` rather than a real `isError`/500 state — tracked for a later story-polish
  pass alongside the same gap in listings; `AiSuggestionBadge` shares the same tooltip-keyboard pattern (out of
  scope here, flag to fix with VerificationBadges' fix pattern).
- Decisions/assumptions:
  - Trust score is a PURE function of {status, verification, listingsCount} (no Date/tenure) so it stays
    deterministic + unit-testable; the seed and every mutation recompute it. Suspended caps at 35, pending at 60,
    banned at 0.
  - Verify/suspend/ban/unban all go through ONE `POST /users/:id/action` endpoint (not four routes) — simpler
    handler, single audit-write path; bulk actions POST the same endpoint per id so they audit too.
  - The three-tier moderation UX is realized as Doğrula (immediate) / Askıya-al / Yasakla on the detail page
    (reason captured by `UserActionDialog`), rather than importing the listing-coupled `ModerationDecision`
    (which bakes in `listing.*` permissions + labels); the pattern is reused, the component is purpose-built.
  - Offices are embedded on `type='office'` users (title/taxId/il/ilçe/memberAgents) and agents reference an
    `officeName` — no separate office CRUD (verification/ban/trust is the focus per the task). `/users/agents`
    stays a placeholder.
  - `il` added to the user entity so the shared `ilOptions`/LOCATIONS (from listings taxonomy) power the city
    facet; users reuse the listings location taxonomy rather than duplicating it.
- Suggested commit message:
  `feat(users): end-to-end users & offices vertical — list/detail, trust score, verify/suspend/ban vs MSW + audit`
- Follow-up (same task, post-review): the `/users/agents` "Emlak Ofisleri" sub-nav was a PlaceholderPage (office
  CRUD was out of the original scope). Turned it into a real `OfficesListPage` — the users list locked to
  `type='office'` via `withOfficeType(query)`, with office-oriented `officeColumns` (unvan/vergiNo/durum/trust/
  doğrulama/üye-danışman-sayısı/şehir), status+ofis-belgesi+il filters, export, and expandable sub-row (email/
  phone/konum/üye danışmanlar). Wired `/users/agents` → OfficesListPage (permission `agent.verify`), added
  full-DoD story (Sidebar/Topnav/Mobile/Loading/Empty/Error + play). Also fixed a seed artifact where every
  office landed in one city (type period === ilKeys period) by varying `il` per triplet. Runtime-verified:
  `/users/agents` renders 10 offices, no non-office rows leak. lint/typecheck/test/build still green.

## 2026-07-24 Task 008 — Kategoriler & Nitelikler
- Built: `features/categories` end-to-end vs MSW, following the listings/users verticals as a template. Zod-first
  schemas (`attributeFieldSchema` id/key/label/type/required/unit?/options?/order, `categorySchema` with an
  `attributes[]` set, `categoryFormSchema` + `attributeFormSchema` (select requires ≥1 option via refine),
  `reorderInputSchema`) + PURE helpers `sortByOrder`/`nextOrder`/`validateAttributeKeyUnique` (unit-tested).
  Taxonomy metadata (`data/categories.ts`: ATTRIBUTE_TYPES + labels, CATEGORY_STATUSES + labels, curated lucide
  CATEGORY_ICONS, per-key ATTRIBUTE_DEFS) and `buildSeedCategories()` that DERIVES the seed from the listings
  vertical's static `CATEGORY_ATTRIBUTES`/`CATEGORY_LABELS` + HEATING/DEED/ZONING enums — one origin, listings
  form untouched. MSW handlers (list w/ status filter + order-sort, detail, create, patch=update/archive,
  `POST /categories/reorder`, `POST /:id/attributes` upsert, `POST /:id/attributes/reorder`, `DELETE
  /:id/attributes/:attrId`) — inputs runtime-validated (`categoryFormSchema`/`attributeFormSchema`/`reorderInputSchema`
  → 422), every write emits an immutable `lib/audit` entry (`category.create|update|archive|reorder`,
  `attribute.create|update|delete|reorder`); duplicate category keys 422. `getCategoriesSnapshot()` read bridge
  (sorted) ready for the listing form to consume later WITHOUT breaking today's static taxonomy. Query/mutation
  hooks (`useCategories` keepPreviousData, `useCategory`, `useUpsertCategory`, `useReorderCategories` optimistic +
  rollback, `useUpsertAttribute`, `useReorderAttributes`, `useDeleteAttribute`). Components: `CategoryStatusBadge`,
  `AttributeTypeBadge` (icon+label+aria-label so type is never color-only), `CategoryFormDialog` (create/edit meta
  via RHF + FieldHelp), `AttributeFormDialog` (RHF + `useWatch` + `useFieldArray` options editor; FieldHelp on every
  named field; key-uniqueness guardrail via `validateAttributeKeyUnique`; select requires options), `AttributeEditor`
  (add/edit/delete + up/down reorder + ConfirmDialog delete), `categoryColumns` (row-level reorder driven by table
  `meta`). Pages: List (DataTable + FilterBar status facet + NL parser + row reorder + "Yeni kategori" + bulk-archive
  + export CSV/XLS), Detail/Edit (`/categories/:id` — meta card + edit dialog + AttributeEditor + audit timeline).
  Router: `/categories` index → List, `/categories/:id` → Detail (routeMeta + `category.manage`); replaced the
  PlaceholderPage. Added an additive `meta?: unknown` prop to the shared `DataTable` (forwarded to
  `table.options.meta`) so columns can trigger reorder. Full-DoD stories for every component + both pages (seeded
  QueryClient + memory-router harness reused from listings `page-story-utils`) + a handlers/helpers unit test proving
  the pure helpers, list/filter/sort, create+audit, duplicate-key 422, archive-audit, category reorder updates order,
  attribute upsert(create→update)+audit, delete+audit, attribute reorder, and `getCategoriesSnapshot` sorting.
- Verification: lint PASS (0 errors; 13 pre-existing warnings) · typecheck PASS · test PASS (530/530, 94 files) ·
  build PASS · build-storybook PASS.
- DoD self-check: ran the `dod-reviewer` agent → 3 blocking gaps, all FIXED before checkpoint:
  (1) native `title="Zorunlu"` on the required marker (help/info must NEVER use `title`) → removed (the icon already
  carries `aria-label="Zorunlu alan"`); (2) reorder icon buttons overrode `size="icon"` (44px) down to 24px via
  `size-6` → dropped the override so up/down keep the 44px WCAG target, laid side-by-side to avoid tall rows;
  (3) the row-selection column had no `bulkActions` wired (dead affordance vs DATA_TABLE_SPEC point 5) → wired a real
  bulk-archive (gated by `category.manage`, ConfirmDialog, PATCHes each selected active category to `archived`
  writing one `category.archive` audit entry per id). Non-blocking improvement applied: helper line above the
  select-options list (rows are `register`-bound without FieldHelp — documented pragmatic exception for a repeating
  2-cell row). Deferred (non-blocking, tracked): make `DataTableProps<TData, TMeta>` generic (currently a double-cast
  boundary for `meta`); page `Error` stories mirror `Empty` rather than a real `isError`/500 state (same cross-cutting
  convention as listings/users — worth one dedicated story-polish task).
- Decisions/assumptions:
  - Parallel-build strategy (option (b) from the task): the new module reads FROM the listings taxonomy and exposes
    `getCategoriesSnapshot()`; `src/features/listings/**` has ZERO diff, so the create-wizard's static
    `CATEGORY_ATTRIBUTES` still works. Actually binding the wizard to the snapshot is a separate optional step.
  - Attribute reorder got its own endpoint (`POST /:id/attributes/reorder`, audit `attribute.reorder`) — a small
    superset of the task's listed attribute audit actions (create|update|delete) — to make the editor's up/down real.
  - Category reorder only offered on the natural-order view (no active sort/filter/search and single full page); the
    list page computes `canReorder` and passes reorder callbacks to the columns via the new DataTable `meta` prop.
  - Numeric form fields: none here (category/attribute meta are all string/enum/boolean/array), so the listings
    string-then-parse dance wasn't needed; `required` binds a `Switch` via a FormField render-fn.
  - `category.manage` already existed in `docs/PERMISSIONS.md` and the nav/router; only super-admin (`*`) holds it,
    which is sufficient for gating — no matrix change needed.
- Suggested commit message:
  `feat(categories): manageable taxonomy — category/attribute CRUD, reorder, bulk-archive vs MSW + audit`

## 2026-07-24 Task 009 — Lokasyonlar (il / ilçe / mahalle)
- Built: `features/locations` end-to-end vs MSW, replicating the 008 categories vertical as a THREE-level
  hierarchy. Zod-first schemas (`neighborhoodSchema` id/name/order, `districtSchema` id/key/label/order/status/
  neighborhoods[], `provinceSchema` id/code[plaka]/label/order/status/districts[], + form schemas
  `provinceFormSchema` [2-digit plaka regex], `districtFormSchema` [slug key], `neighborhoodFormSchema` [name],
  `reorderInputSchema`) + PURE helpers `validateCodeUnique`/`validateKeyUnique` (unit-tested). Extracted the
  shared ordering helpers to a new `src/lib/order.ts` (`sortByOrder`/`nextOrder`); `categories/schemas/category.ts`
  now RE-EXPORTS them (single origin, no behavior change, no duplication) and `locations/schemas/location.ts` does
  the same. Seed DERIVED from the listings vertical's static `LOCATIONS` (`buildSeedProvinces()`), so `taxonomy.ts`
  has ZERO diff (no regression); `getLocationsSnapshot()` read bridge ready for the listing form/filters to consume
  later. MSW handlers (province list w/ status filter + code/label search + order-sort, detail, create, patch=
  update/archive, reorder; district upsert/reorder/delete; neighborhood upsert/reorder/delete) — inputs runtime-
  validated (`safeParse` → 422; duplicate plaka & duplicate district-key → 422), every write emits an immutable
  `lib/audit` entry (`location.create|update|archive|delete|reorder` with a `level` field in the payload
  distinguishing province/district/neighborhood; resource `province:<id>` so district/neighborhood changes show on
  the province timeline, top-level reorder `province:*`). Query/mutation hooks (`useProvinces` keepPreviousData,
  `useProvince`, `useUpsertProvince`, `useReorderProvinces` optimistic + rollback, `useUpsertDistrict`,
  `useReorderDistricts`, `useDeleteDistrict`, `useUpsertNeighborhood`, `useReorderNeighborhoods`,
  `useDeleteNeighborhood` — neighborhood hooks take `provinceId` and carry `districtId` in the mutate payload).
  Components: `LocationStatusBadge`, `provinceColumns` (row-level reorder via table `meta`), `ProvinceFormDialog`/
  `DistrictFormDialog`/`NeighborhoodFormDialog` (RHF + FieldHelp on every field), `LocationTree` (the hierarchical
  editor — generalizes 008 `AttributeEditor` to two nested levels: districts with add/edit/delete/reorder + an
  expandable per-district `NeighborhoodEditor` with the same affordances; all mutation hooks called once at the top
  and threaded down as props). Pages: List (`/locations` — DataTable + FilterBar status facet + NL parser + row
  reorder + "Yeni il" + bulk-archive + export CSV/XLS + expandable district-summary sub-row), Detail/Edit
  (`/locations/:id` — province meta card + edit dialog + `LocationTree` + audit timeline). Router: `/locations`
  index → List, `/locations/:id` → ProvinceDetail (routeMeta + `location.manage`); replaced the PlaceholderPage.
  Full-DoD stories for every component + both pages (seeded QueryClient + memory-router harness reused from listings
  `page-story-utils`) + a handlers/helpers unit test (pure helpers, list/filter/sort, create+audit, duplicate-plaka
  422, invalid-plaka 422, archive-audit, province reorder, district upsert[create→update]+audit, duplicate district-
  key 422, district delete+audit, district reorder, neighborhood upsert/reorder/delete, snapshot sorting).
- Verification: lint PASS (0 errors; 13 pre-existing warnings) · typecheck PASS · test PASS (590/590, 102 files) ·
  build PASS · build-storybook PASS.
- DoD self-check: ran the `dod-reviewer` agent → NO blocking issues, "Ready to commit: YES". Applied one non-blocking
  cleanup (dropped unused `LOCATION_LEVELS`/`LOCATION_LEVEL_LABELS` dead exports; audit payload uses the narrowed
  string literals directly). Deferred (non-blocking, tracked): page `Error` stories mirror `Empty` rather than a real
  `isError`/500 state — the SAME cross-cutting convention as listings/users/categories; folded into the 010 task
  notes to fix the pattern there. `location.manage` remains super-admin-only (`*`), identical to `category.manage`
  and sufficient for gating — no matrix change.
- Decisions/assumptions:
  - Parallel-build strategy (task risk note): the new module READS from listings' `LOCATIONS` and exposes
    `getLocationsSnapshot()`; `src/features/listings/**` + `taxonomy.ts` have ZERO diff, so the create-wizard's
    cascading location step + all il/ilçe/mahalle filters still work off the static taxonomy. Binding them to the
    snapshot is a separate optional step.
  - Shared `lib/order.ts` chosen over copy-paste (task recommendation); categories re-exports for backward compat.
  - Neighborhoods have NO status (only id/name/order per the task); province + district carry status. District
    delete cascades its neighborhoods (single `location.delete` audit entry for the district).
  - Province id `P-<plaka>` for seeded rows (`P-new-N` for created); audit `level` lives inside before/after so the
    single `location.*` action family disambiguates the three levels without new action names.
- Suggested commit message:
  `feat(locations): manageable il/ilçe/mahalle taxonomy — hierarchical CRUD, reorder, bulk-archive vs MSW + audit`

## 2026-07-24 Task 010 — Mesajlar & Şikayetler
- Built: `features/messages` end-to-end vs MSW, following the users vertical as the template (three-tier
  moderation + reason-required + audit). Zod-first schemas (`reportSchema` id/subjectType[listing|user|message]/
  subjectId/subjectLabel/reasonCategory[spam|fraud|inappropriate|misinformation|other]/description/status[open|
  resolved|dismissed|escalated]/priority[low|normal|high]/reporterName/createdAt, `reportActionSchema` with a
  reason-required refine [dismiss/escalate require reason; resolve does not], `reasonFormSchema`). Taxonomy/labels
  (`data/reports.ts`: subject types, reason categories, statuses, priorities, actions + `REPORT_ACTION_STATUS`
  mapping resolve→resolved/dismiss→dismissed/escalate→escalated). Deterministic 30-row seed (mixed subject/reason/
  priority, skewed toward `open` so the queue has work). MSW handlers (list w/ filter status/subjectType/
  reasonCategory/priority + q search over subjectLabel/description/reporterName, sort, paginate; detail; single
  `POST /reports/:id/action` runtime-validated via `reportActionSchema.safeParse` → 422; every write emits an
  immutable `lib/audit` entry `report.resolve|dismiss|escalate`, resource `report:<id>`, before/after status +
  reason). Query/mutation hooks (`useReports` keepPreviousData, `useReport`, `useReportAction` optimistic status
  flip + rollback + sonner toasts). Components: `ReportStatusBadge` (label carries meaning), `ReportPriorityBadge`
  (icon + label + `aria-label` — color never the sole signal), `ReasonCategoryBadge` (icon + label + aria-label),
  `ReportDecision` (purpose-built three-tier OK→resolve / Belirsiz→escalate / NOK→dismiss; escalate/dismiss reason
  required via a focus-managed popover WITH a `FieldHelp` affordance + `aria-describedby`; gated by a single
  `message.moderate` permission — NOT the listing-coupled ModerationDecision), `ReportActionDialog` (RHF + FieldHelp
  reason capture for bulk dismiss/escalate), `reportColumns`. Pages: List (`/messages` — DataTable + FilterBar with
  status/subjectType/reasonCategory/priority facets + NL parser + bulk resolve/dismiss + export CSV/XLS with scope +
  expandable sub-row showing the quoted description), Detail (`/messages/:id` — complaint meta + quoted-content
  blockquote + subject deep-link [listing/user] + three-tier `ReportDecision` + audit timeline; closed complaints
  show a "no further action" note). Router: `messages` PlaceholderPage → real List + `:id` Detail (routeMeta +
  `message.moderate`). MSW registry updated. Full-DoD stories for every component + both pages (seeded QueryClient +
  memory-router harness) + a handlers unit test (list/filter/sort, resolve+audit, dismiss/escalate+reason audit,
  reason-required 422 guardrail for BOTH dismiss and escalate with the row left untouched).
- Verification: lint PASS (0 errors; 13 pre-existing warnings) · typecheck PASS · test PASS (640/640, 110 files) ·
  build PASS · build-storybook PASS.
- DoD self-check: ran the `dod-reviewer` agent → 1 blocking gap, FIXED before checkpoint: `ReportDecision`'s
  escalate/dismiss reason popover rendered a raw `Label`+`Textarea` (no FieldHelp / no `aria-describedby`) — a
  Golden-Rule-6 violation → added a `FieldHelp` affordance beside the label, a helper `<p>`, and wired
  `aria-describedby` into the Textarea. Re-verified green. Non-blocking, tracked: bulk actions cover resolve/dismiss
  only (matches the task spec "bulk resolve/dismiss"; escalate stays per-row on detail, mirroring users' suspend/ban
  bulk); the same raw-textarea anti-pattern still exists in the pre-existing `listings/ModerationDecision.tsx`
  (out of scope — flag to fix when that vertical is next touched).
- **Debt paid (009 lesson):** page `Error` stories now drive a REAL `isError` state (not an Empty mirror) — added
  `seedQueryError()` in `page-story-utils` that builds the query cache into an error state deterministically (no
  network); the List Error story asserts `role="alert"` + a "Tekrar dene" retry button, the Detail Error story
  asserts the "Şikayet bulunamadı" ErrorState. This is the first vertical with a genuine page-error story; the same
  helper can retrofit listings/users/categories/locations in a later story-polish pass.
- Decisions/assumptions:
  - Three-tier maps OK→resolve (no reason, green), Belirsiz→escalate (reason, outline), NOK→dismiss (reason,
    destructive). Escalate/dismiss require a reason both in the UI popover and server-side (`safeParse` → 422).
  - Single `POST /reports/:id/action` endpoint (not three routes); bulk POSTs the same endpoint per id so each audits.
  - Quoted content is mock (`subjectLabel` + `subjectType` + `description`); real subject relations arrive with
    FastAPI. Detail page deep-links to the subject for listing/user (message has no detail route).
  - `message.moderate` already lives on moderator + support (matrix ready) — no permission change needed.
  - The server refine requires a NON-EMPTY reason (matching the popover); `reasonFormSchema`'s stricter ≥5-char rule
    is intentionally the dialog-form's client-side rule (bulk `ReportActionDialog`), not enforced by the endpoint.
- Suggested commit message:
  `feat(messages): reports/complaints vertical — three-tier moderation queue vs MSW + audit; real page-error stories`
