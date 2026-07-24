# Task 003 — Form System

## Objective
Build the form system: `FormField` (enforces FieldHelp), `FieldHelp`, `FormSection`, `FormErrorSummary`, and the multi-step `Wizard`.

## Steps
1. `FieldHelp` — icon-only (?) tooltip/popover, (!) warning; `aria-describedby`; focus-managed popover; 44px targets; never `title`.
2. `FormField` — label + control + FieldHelp/helper; dev-time throw if neither help nor helper provided; RHF integration + error display.
3. `FormSection`, `FormErrorSummary` (anchors to fields).
4. `Wizard/Stepper` — per-step Zod validation, drafts/autosave, dirty-warning, review step.
5. Specialized inputs: DatePicker, RangeInput (price/m²), CascadingSelect (il->ilçe->mahalle).
6. Validation UX: on-blur + submit, reward-early-punish-late; optimistic submit + toasts.
7. Stories incl. FieldHelp demo + error-summary + wizard; `play` tests; a11y clean.

## Acceptance criteria
- [ ] Every field goes through FormField with a help affordance (enforced).
- [ ] Wizard validates per step + drafts; error summary anchors work.
- [ ] Cascading + range inputs behave per FORMS_UX.md; strict TS.
- [ ] Verify green; `dod-reviewer` PASS. STOP for user commit.
