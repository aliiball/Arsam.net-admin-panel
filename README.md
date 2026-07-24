# arsam.net — Admin Panel

Enterprise back-office for arsam.net, a Turkish real-estate-only classifieds marketplace (emlak vertical). Built solo with Claude Code ("vibe coding"). This repo starts as a set of guardrail files; the app code is generated task-by-task.

## Stack
React 19 + TypeScript (strict) + Vite · Tailwind v4 + shadcn/ui (new-york) · React Router v7 (data mode) · TanStack Query v5 / Table v8 / Virtual v3 · React Hook Form + Zod · Storybook 10 (a11y + Vitest addon) · lucide-react, recharts, React Leaflet, sonner. Mocks via MSW; FastAPI REST later.

## Prerequisites
- Node 22+ (Storybook 10 is ESM-only; needs Node 20.16+/22.19+/24+).
- npm.

## Commands
- `npm run dev` — dev server
- `npm run build` — typecheck + build
- `npm run typecheck` / `npm run lint`
- `npm run test` — Vitest (unit + Storybook interaction/a11y)
- `npm run storybook` / `npm run build-storybook`

## Vibe-coding workflow + task system
- Read `CLAUDE.md` first; specs in `docs/`.
- One task at a time; `docs/tasks/CURRENT.md` points at the active task. Claude plans -> implements -> verifies -> `dod-reviewer` -> STOPS.
- `/clear` between tasks; resume with "read docs/tasks/CURRENT.md and continue".

## The user commits manually
Claude Code is blocked from all git write operations (see `.claude/settings.json`). YOU review and commit between tasks.

## Design note
The visual identity is ORIGINAL (see `docs/DESIGN_SYSTEM.md`). The sahibinden-v2 repo is a component-TYPE reference only — never a visual source.
