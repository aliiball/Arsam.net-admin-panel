---
name: create-component
description: The arsam.net ritual for creating a new UI component. Use whenever the user asks to build, add, or scaffold a component, primitive, or shell part. Enforces co-located files, cva variants, token-only styling, full story states, play tests, and FieldHelp for form fields.
---

## When to use
Any new presentational or shell component under `src/components/` or a feature's `components/`.

## Steps
1. **Confirm placement & name.** PascalCase folder + file. Co-locate everything:
   ```
   ComponentName/
     ComponentName.tsx
     ComponentName.stories.tsx
     ComponentName.test.tsx        # optional if fully covered by stories' play tests
     index.ts                      # export { ComponentName } and its types
   ```
2. **Types first.** Define the `Props` interface. Respect strict TS (no `any`; guard indexed access).
3. **Variants via cva.** Express visual variants with `class-variance-authority`; merge classes with `cn()`. Token-only styling — semantic Tailwind tokens ONLY (`bg-card`, `text-muted-foreground`, `border-border`, ...). NEVER hardcode colors. NEVER reproduce sahibinden-v2 visuals.
4. **AI-first hooks.** Add `data-action` / `data-entity` on primary interactive elements (see `docs/AI_FIRST.md`).
5. **FieldHelp (form fields only).** If the component is a form field, it MUST render through `FormField` and expose a help affordance via `FieldHelp` (tooltip on hover/focus, popover on click for long content) and/or inline helper. Wire `aria-describedby`; never use `title`. Touch target >= 44px.
6. **Stories (CSF3).** Provide: `Default`, `Loading`, `Empty`, `Error`, `Mobile` (mobile viewport). Add a `play` function asserting core interaction. If this is a SHELL component, ALSO add `Sidebar` and `Topnav` stories rendering both layout modes.
7. **Accessibility.** Roles, labels, focus management, keyboard support.
8. **Verify.** Run `npm run lint`, `npm run typecheck`, `npm run test`. Fix all issues.
9. **Self-check DoD** against `docs/RULES.md`. Then invoke the `dod-reviewer` agent.
10. **STOP.** Report the files created + suggested commit message. Do NOT commit — the user commits manually.
