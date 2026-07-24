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

