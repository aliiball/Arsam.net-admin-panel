# Hard Rules & Definition of Done

## Hard constraints
1. **Git policy:** Claude never runs git write ops (commit/push/tag/rebase/reset/merge/checkout/restore/clean/stash/cherry-pick/revert). Read-only git only. User commits manually. Enforced in `.claude/settings.json`.
2. **Never copy sahibinden-v2 visuals.** Original design system only (DESIGN_SYSTEM.md). sahibinden-v2 = component-type reference, reinterpreted.
3. **Layout modes required:** shell components must support and be storied in BOTH `sidebar` and `topnav` (+ mobile).
4. **Token-only styling:** no hardcoded colors in components.
5. **FieldHelp mandatory:** every form field has a help/helper affordance via FormField.
6. **Advanced tables:** lists follow the 10-point DATA_TABLE_SPEC contract.

## Forbidden libraries / modes
Next.js; React Router framework mode; SSR/RSC; TanStack Table v9 beta; CSS-in-JS runtime libs; the `title` attribute for tooltips; any sahibinden-v2 visual assets.

## Required patterns
React Router v7 data mode (`createBrowserRouter`); TanStack Query for server state; RHF+Zod (`zodResolver`); Zod as type source (`z.infer`); MSW for mocks; `cva`+`cn` for variants; lucide icons; recharts with chart tokens.

## Naming
Components PascalCase; hooks `useX`; files match export; permissions `resource.action`; features lowercase folders; Zod schemas `xSchema`.

## Accessibility
WCAG 2.2 AA (4.5:1 text, 3:1 large/UI); visible focus; keyboard support; 44px targets; color never the sole signal; managed focus for dialogs/popovers.

## Definition of Done (per unit)
- [ ] Co-located files (Component/stories/test/index) or feature layout.
- [ ] Stories: default/loading/empty/error/mobile (+ sidebar/topnav for shell).
- [ ] `play` test for interactive behavior; a11y clean.
- [ ] Token-only styling; no hardcoded colors; no sahibinden-v2 visuals.
- [ ] Form fields via FormField with FieldHelp/helper.
- [ ] Tables conform to the contract + URL-synced.
- [ ] Strict TS passes; no `any`/`@ts-ignore`.
- [ ] Permissions gated where relevant; audit written for mutations.
- [ ] `lint` + `typecheck` + `test` + `build` green.
- [ ] `dod-reviewer` PASS. Then STOP for user commit.
