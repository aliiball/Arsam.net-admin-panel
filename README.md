# arsam.net — Admin Panel

Enterprise back-office for **arsam.net**, a Turkish real-estate-only classifieds
marketplace (emlak vertical: konut / işyeri / arsa / devremülk / turistik). The
backend (FastAPI REST) lands later — today the app runs fully on in-browser
**MSW mocks**, so it boots with **zero configuration**.

## Stack

React 19 + TypeScript (strict) + Vite · Tailwind v4 + shadcn/ui (new-york) ·
React Router v7 (data mode) · TanStack Query v5 / Table v8 / Virtual v3 ·
React Hook Form + Zod · Storybook 10 (a11y + Vitest addon) · lucide-react,
recharts, React Leaflet, sonner. Mocks via MSW; FastAPI REST later.

## Prerequisites

- **Node `>=20.19`** — CI runs **22**, the version pinned in [`.nvmrc`](.nvmrc).
  With [nvm](https://github.com/nvm-sh/nvm): `nvm install && nvm use`.
- **npm** (this repo uses `package-lock.json` — install with `npm ci`).

## Getting started

```bash
git clone <this-repo-url>
cd arsam.net-admin-panel

nvm use                                       # Node 22 (from .nvmrc)
npm ci                                         # exact deps from the lockfile
npx playwright install --with-deps chromium    # only needed to run the tests
npm run dev                                     # http://localhost:5173
```

No `.env` is required to run — the only custom variable, `VITE_API_BASE_URL`,
falls back to `/api`. Copy [`.env.example`](.env.example) to `.env.local` only if
you later need to point at a real backend.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server (http://localhost:5173) |
| `npm run build` | Typecheck (`tsc -b`) + production build |
| `npm run typecheck` | `tsc -b --noEmit` |
| `npm run lint` | ESLint |
| `npm run test` | Vitest — unit **+** browser-based Storybook interaction/a11y tests |
| `npm run storybook` | Storybook dev server (http://localhost:6006) |
| `npm run build-storybook` | Static Storybook |

> `npm run test` runs the Storybook project in a real browser, so the one-time
> `npx playwright install chromium` above is required before it will pass locally.

## Project layout

- `src/components/` — UI primitives, shell (AppShell / dock / nav), forms, data
- `src/features/` — domain modules (listings, users, categories, locations, …)
- `src/lib/` — cross-cutting logic (permissions, layout, ai, msw, api)
- `docs/` — product & engineering specs (start with `docs/PRD.md`,
  `docs/ARCHITECTURE.md`, `docs/DESIGN_SYSTEM.md`, `docs/RULES.md`)
- `.claude/` — repo-scoped Claude Code agents, skills, and settings

## Conventions

Engineering rules and the Definition of Done live in **[`CLAUDE.md`](CLAUDE.md)**
and `docs/RULES.md`. Highlights: token-only styling (no hardcoded colors),
mobile-first, every component ships Storybook stories (default / loading / empty
/ error / mobile), every form field has a `FieldHelp` affordance, and app UI copy
is Turkish while code / comments / docs stay English.

The visual identity is ORIGINAL (see `docs/DESIGN_SYSTEM.md`); the sahibinden-v2
repo is a component-**type** reference only, never a visual source.

## CI

GitHub Actions run on every push / PR to `main`:

- **Quality** (`.github/workflows/quality.yml`) — lint · typecheck · test · build · build-storybook
- **Pages** (`.github/workflows/pages.yml`) — deploys the app + Storybook +
  report to GitHub Pages. Requires **Settings → Pages → Source = "GitHub
  Actions"** to be enabled once per repo by an admin.
