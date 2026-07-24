---
name: create-feature
description: The arsam.net ritual for creating a feature module (a domain vertical such as listings, users, categories, locations, promotions, messaging, reports, audit). Use when the user asks to add or scaffold a feature/module/domain slice. Enforces Zod-first schemas, MSW handlers, nav-schema wiring for BOTH layout modes, stories, tests, and CURRENT.md updates.
---

## When to use
Any new domain module under `src/features/<feature>/`.

## Folder layout
```
src/features/<feature>/
  api/
    queries.ts          # TanStack Query hooks (useX, useXList)
    mutations.ts        # mutations with optimistic updates
    handlers.ts         # MSW handlers implementing the resource contract
  components/           # feature-specific presentational components
  forms/                # RHF + Zod forms (via FormField + FieldHelp)
  hooks/
  pages/                # route components (list, detail, create, ...)
  schemas/              # Zod schemas (SOURCE OF TRUTH for types)
  types/                # types derived from schemas via z.infer
  index.ts              # public surface of the feature
```

## Steps
1. **Zod schema first.** Model the entity + list/query params in `schemas/`. Derive TS types with `z.infer`. All validation flows from here.
2. **MSW handlers.** Implement `GET /<resource>?page&pageSize&sort&filters` -> `{ items, total, page, pageSize }`, plus detail/create/update/delete as needed. Register in the MSW server.
3. **Query/mutation hooks.** TanStack Query v5. Mutations use `useOptimistic`/optimistic cache updates + `sonner` toasts.
4. **Pages & routes.** Add route objects to the data-mode router with `loader`/`action` where sensible. Attach `routeMeta` (title, permission, aiEntity).
5. **Nav-schema wiring (BOTH modes).** Register the feature's entry in the single `navSchema` (one source of truth). Confirm it renders correctly in `sidebar` AND `topnav` modes and in mobile drawer/bottom nav.
6. **Forms.** Build via `FormField` + `FieldHelp` (mandatory help affordance). Multi-step flows use the wizard with per-step Zod validation + drafts.
7. **Tables.** Any list uses the DataTable per `docs/DATA_TABLE_SPEC.md` (server-driven, URL-synced).
8. **Permissions.** Gate UI + routes per `docs/PERMISSIONS.md` (`resource.action`).
9. **Stories + tests** for feature components (incl. mobile; shell-touching parts get both modes).
10. **Verify** (`lint`, `typecheck`, `test`, `build`) and run the `dod-reviewer` agent.
11. **Update `docs/tasks/CURRENT.md`** — mark progress / point to the next task.
12. **STOP for the user's manual commit.** Report files + suggested commit message.
