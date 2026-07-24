# Task 000 — Foundation

## Objective
Stand up the project skeleton with the locked stack and the ORIGINAL design tokens; verify dev/build/storybook run.

## Steps
1. Scaffold Vite + React 19 + TypeScript. Enable strict, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`.
2. Install + configure Tailwind v4 (Vite plugin, CSS-first). Create `src/styles/theme.css` and paste the EXACT tokens from `docs/DESIGN_SYSTEM.md` (`:root` + `.dark` + `@theme inline`). Wire Geist/Inter + Geist Mono with fallbacks; set `tabular-nums` on data containers.
3. Run `npx shadcn init` for Vite (new-york, CSS variables true, base neutral). Add Button + Card to confirm theming.
4. React Router v7 DATA mode: `app/router.tsx` with `createBrowserRouter` + a placeholder route; `RouterProvider` in `main.tsx`.
5. Storybook 10 init (`@storybook/react-vite`); add `@storybook/addon-a11y` + `@storybook/addon-vitest`; register mobile viewports; add theme/layout toolbar decorators.
6. Providers: `QueryClientProvider`, `ThemeProvider`, `LayoutProvider` (reads/writes `arsam.layout` in localStorage), `Toaster` (sonner).
7. MSW setup: worker + one demo handler using the resource contract.
8. Add npm scripts: dev, build, typecheck, lint, test, storybook, build-storybook.
9. Verify: `npm run dev` (renders), `npm run build` (green), `npm run storybook` (Button/Card stories render in light+dark).

## Acceptance criteria
- [ ] Strict TS config as specified; `npm run typecheck` green.
- [ ] Tokens implemented EXACTLY from DESIGN_SYSTEM.md; no hardcoded colors; no sahibinden-v2 visuals.
- [ ] Data-mode router renders; no framework mode/SSR.
- [ ] Storybook runs with a11y + vitest addons + mobile viewports.
- [ ] Providers + MSW wired; demo query works against mock.
- [ ] `dev`, `build`, `storybook` all verified. STOP for user commit.
