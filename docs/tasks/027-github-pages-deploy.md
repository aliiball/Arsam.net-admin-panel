# Task 027 — GitHub Pages Deploy (app + Storybook + report)

**Goal:** publish the whole showcase as ONE GitHub Pages site under
`https://aliiball.github.io/Arsam.net-admin-panel/`:

- `/` — the live admin panel (mock-only demo, MSW in-browser, no backend)
- `/storybook/` — the static Storybook (133 stories)
- `/report.html` — the self-contained executive report (Task 026)

This is the LAST task of the modernization arc. It is deploy plumbing only —
no feature work.

## Why the app needs runtime changes

The app is a Vite SPA that assumes it is served from `/`. A GitHub Pages
*project* site serves from `/<repo>/`, so three things break unless fixed:

1. **Asset base path.** Vite must emit `/<repo>/`-prefixed asset URLs → set
   `base` at build time (env-driven, so dev/Storybook stay at `/`).
2. **Client routing base.** `createBrowserRouter` must strip the repo segment →
   `basename: import.meta.env.BASE_URL`.
3. **No backend.** In dev the app runs against MSW; in the previous prod build
   MSW was gated OFF (`if (!import.meta.env.DEV) return`), so a deployed build
   would fire real network calls into the void. The Pages build is a
   **mock-only demo**, so MSW must run in production too (skipped only under
   `test`), with a base-aware service-worker URL.

Deep links (`/<repo>/listings`) 404 on static hosting → ship a SPA fallback by
copying the built `index.html` to `404.html`. Because Vite emits absolute,
base-prefixed asset URLs, the fallback boots correctly at any path and the
browser URL is preserved (React Router then routes it) — no redirect hack, no
HashRouter (DATA-mode `createBrowserRouter` is locked by CLAUDE.md).

## Changes

- `vite.config.ts` — `base: process.env.APP_BASE ?? '/'` (function form).
- `src/app/router.tsx` — `basename` from `import.meta.env.BASE_URL`
  (trailing slash stripped; `'/'` fallback for dev).
- `src/main.tsx` — enable MSW in dev **and** prod; skip only `MODE === 'test'`.
- `src/lib/msw/browser.ts` — `serviceWorker.url =
  \`${import.meta.env.BASE_URL}mockServiceWorker.js\`` (dev → `/…`, unchanged).
- `package.json` — add `"preview": "vite preview"` for local base-path verify.
- `.github/workflows/pages.yml` — build app with `APP_BASE=/<repo>/`, build
  Storybook into `dist/storybook`, copy `docs/report.html` → `dist/report.html`,
  copy `dist/index.html` → `dist/404.html`, `touch dist/.nojekyll`, then
  `upload-pages-artifact` + `deploy-pages`. Repo name comes from
  `${{ github.event.repository.name }}` (no hardcode). Storybook build is NOT
  given `APP_BASE` (its static output uses relative asset URLs → works under the
  `/storybook/` subpath).

## Acceptance

- Local: `APP_BASE=/Arsam.net-admin-panel/ npm run build` emits base-prefixed
  assets; `vite preview` serves the app, MSW boots, a deep link renders, and
  `dist/storybook/index.html` + `dist/report.html` load.
- `npm run lint` / `typecheck` / `test` / `build` / `build-storybook` all green.
- The Pages workflow is valid and, once the user enables Pages (Settings →
  Pages → Source: GitHub Actions) and pushes to `main`, publishes all three
  surfaces.

## Notes / decisions

- `base` is env-driven (`APP_BASE`) NOT coupled to Vite's `command`, so the
  Storybook build (which also runs Vite in build mode and merges our config)
  stays at `base: '/'` unless `APP_BASE` is exported — it is scoped to the app
  build step only.
- The user must flip Settings → Pages → Source to "GitHub Actions" once; the
  workflow cannot do that. Report this in the hand-off.
</content>
</invoke>
