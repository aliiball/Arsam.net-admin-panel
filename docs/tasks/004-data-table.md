# Task 004 — Data Table

## Objective
Implement the DataTable meeting the full 10-point contract against a mock API, with URL-synced state and mobile card transform.

## Steps
1. `DataTable` (TanStack Table v8) — server-driven pagination/sort/filter vs MSW resource contract.
2. `FilterBar` — faceted counts, multi-select, price/m² + date ranges, cascading location, chips, saved filters, NL box (confirm-before-apply).
3. Column visibility, pinning, resizing, reordering; row selection + `BulkActionBar`; expandable rows; saved views.
4. `ExportMenu` (CSV/Excel); virtualization (TanStack Virtual) + sticky header; `DensityToggle`.
5. URL sync (page/pageSize/sort/filters/view); deep-linkable.
6. Mobile card transform below `lg`.
7. Stories (default/loading/empty/error/mobile) + `play` tests (sort, filter, select, bulk); a11y clean.

## Acceptance criteria
- [ ] All 10 contract points implemented; URL is source of truth.
- [ ] Mobile card transform works; virtualization + sticky header verified.
- [ ] Stories + interaction tests; a11y clean; strict TS.
- [ ] Verify green; `dod-reviewer` PASS. STOP for user commit.
