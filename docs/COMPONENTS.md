# Component Inventory & Build Order

Answers the core question: **What are the must-have components of an enterprise-level admin panel?** Props philosophy: small, typed, composition-first; variants via `cva`; styling via semantic tokens + `cn()`. Every component is Storybook-covered (default/loading/empty/error/mobile; shell adds sidebar+topnav).

## Approved component reference (from sahibinden-v2) — TYPES ONLY, reinterpret
These are component *types* the user validated and liked in `github.com/aliiball/sahibinden-v2`. Reinterpret each in the "Calm Signal" language; NEVER visually port them:
- A floating assistant dock / FAB -> reinterpret as our `AssistantDock` in the new palette (no liquid-glass).
- An assistant panel with suggestions <-> modules modes -> our `AssistantPanel` (see AI_FIRST.md).
- Chart usage patterns -> recharts with our chart-1..5 tokens.
- Card grids -> our `CardGrid` with token elevation.
These inform behavior/inventory, not visuals.

## P0 — Foundation & shell
- **AppShell** (dual layout modes) + `LayoutProvider`.
- **SidebarShell**: collapsible Sidebar (shadcn sidebar), sections from `navSchema`.
- **TopnavShell**: horizontal nav + overflow "More"/mega-menu, from same `navSchema`.
- **Topbar**: breadcrumbs, search trigger, theme toggle, density toggle, LayoutSwitcher, user menu.
- **MobileNav**: drawer + bottom navigation (<=5 items).
- **CommandPalette** (Cmd/Ctrl-K): navigate to any module + quick actions.
- **LayoutSwitcher**: toggle sidebar/topnav + density; persists.
- **ThemeToggle** (light/dark/system).

## P0 — Primitives (shadcn/ui new-york, themed)
Button, Input, Textarea, Select, Combobox, Checkbox, Radio, Switch, Slider, Badge, Avatar, Tooltip, Popover, Dialog, Sheet, DropdownMenu, Tabs, Accordion, Card, Separator, Skeleton, Toast (sonner), Breadcrumb, Pagination, ScrollArea.

## P0 — Feedback & state
EmptyState, ErrorState, LoadingState/Spinner, InlineAlert, ConfirmDialog.

## P1 — Forms
FormField (wrapper, enforces FieldHelp), FieldHelp, FormSection, FormErrorSummary, Wizard/Stepper, DatePicker, RangeInput (price/m²), CascadingSelect (il->ilçe->mahalle), FileUpload/ImageDropzone.

## P1 — Data
DataTable (full contract), FilterBar (faceted/multi-select/ranges/date/cascading/chips/saved/NL box), ColumnVisibility, BulkActionBar, DensityToggle, ExportMenu (CSV/Excel), KpiCard, ChartCard (recharts), MapView (React Leaflet + markercluster).

## P2 — Domain
ListingCard, ListingStatusBadge, ModerationQueueItem, ModerationDecision (OK/Uncertain/NOK), UserTrustBadge, VerificationPanel, DopingPackagePicker, ComplaintCard, AuditTimeline, PermissionMatrixEditor.

## P2 — AI layer
AssistantDock (FAB, reinterpreted), AssistantPanel (suggestions<->modules), NLFilterInput (confirm-before-apply), AiSuggestionBanner.

## Composition rules
- Container/presentational split; features own data, components stay presentational.
- No feature imports inside `components/ui`.
- Every interactive element: keyboard + `aria` + `data-action`/`data-entity`.
