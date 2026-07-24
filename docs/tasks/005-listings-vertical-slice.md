# Task 005 — Listings Vertical Slice

## Objective
Deliver the listings module end-to-end against MSW: list + detail + create wizard + moderation queue.

## Steps
1. `features/listings` per create-feature layout. Zod schemas first (listing + query params + attribute sets per category).
2. MSW handlers for list/detail/create/update/moderate using the resource contract.
3. Query/mutation hooks (optimistic moderate + toasts).
4. Pages: List (DataTable + FilterBar), Detail, Create (multi-step Wizard with dynamic category attributes + cascading location), Moderation Queue (OK/Uncertain/NOK).
5. Wire routes (data mode + routeMeta) and the listings entry in `navSchema` (verify in BOTH layout modes + mobile).
6. Permissions gating (`listing.*`) + audit entries on moderation.
7. Stories for feature components (incl. mobile; shell-touching parts both modes) + `play` tests.
8. Update `docs/tasks/CURRENT.md`.

## Acceptance criteria
- [ ] List is server-driven + URL-synced; detail renders; create wizard validates per step with dynamic fields; moderation queue supports OK/Uncertain/NOK with audit.
- [ ] Nav entry works in sidebar + topnav + mobile.
- [ ] FieldHelp on every field; token-only; strict TS; a11y clean.
- [ ] Verify green; `dod-reviewer` PASS. STOP for user commit.
