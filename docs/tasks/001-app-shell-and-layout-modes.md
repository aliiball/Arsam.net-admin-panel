# Task 001 — AppShell + Layout Modes

## Objective
Build the configurable AppShell with `sidebar` and `topnav` modes from ONE nav schema, plus command palette, theme/density toggles, layout switcher, and mobile drawer/bottom nav.

## Steps
1. `config/nav-schema.ts` — single `navSchema` (all ten modules, permissions, icons, aiEntity).
2. `config/layout.ts` + `LayoutProvider` — `LayoutConfig`, persistence, `setMode/toggleSidebar/setDensity`, switch without reload.
3. `SidebarShell` (shadcn sidebar, collapsible) and `TopnavShell` (horizontal nav + priority+ overflow "More"/mega-menu), both consuming `navSchema`.
4. `Topbar` (breadcrumbs, search trigger, ThemeToggle, DensityToggle, LayoutSwitcher, user menu).
5. `CommandPalette` (Cmd/Ctrl-K) — navigate every module + quick actions.
6. `MobileNav` — drawer + bottom navigation (<=5 items) + palette; both modes converge below `lg`.
7. Stories: each shell component gets `Sidebar`, `Topnav`, and `Mobile` stories; `play` tests for switching + palette.

## Acceptance criteria
- [ ] One nav schema powers both modes; parity of module access.
- [ ] `layoutMode` switch persists and needs no reload.
- [ ] topnav overflow works; command palette reaches every module.
- [ ] Mobile convergence verified.
- [ ] Both-mode + mobile stories present; a11y clean; strict TS.
- [ ] Verify green; `dod-reviewer` PASS. STOP for user commit.
