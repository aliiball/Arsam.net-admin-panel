# Forms UX

## Principles
- **Single-column by default.** Progressive disclosure for advanced/optional fields.
- **Validation:** validate on blur + on submit; "reward early, punish late" (don't error while first typing; validate once a field is touched/blurred; clear errors as soon as valid).
- **Error summary** at the top with anchor links to invalid fields.
- **Dirty-state warning** on navigation; **autosave** drafts where sensible (wizard, long forms).
- **Optimistic updates** + `sonner` toasts; rollback on failure.
- **Keyboard support** throughout; Enter submits where safe; Esc cancels dialogs.

## FieldHelp (MANDATORY) + FormField enforcement
Every field renders through `FormField`, which REQUIRES a help affordance. A field with neither help nor helper text fails DoD.
- **(?) help** — icon-only button; tooltip on hover/focus; popover on click for long content.
- **(!) warning** — icon-only; conveys caution (e.g., value triggers re-moderation).
- **(helper)** — inline helper text under the label.
Accessibility: `aria-label` on the icon button; help content wired via `aria-describedby`; popover manages focus (trap + restore); touch targets >= 44px; **never** the `title` attribute.
```tsx
<FormField
  name="grossArea"
  label="Brüt m² (gross area)"
  help="Total floor area including walls. Net alan (usable area) is entered separately."
  helper="Enter a number in square meters."
  warning={value > 100000 ? 'Unusually large — double-check.' : undefined}
>
  <Input inputMode="numeric" data-entity="listing" data-action="edit-field" />
</FormField>
```
`FormField` throws in dev if it renders a control without at least one of `help`/`helper`.

## Multi-step listing wizard
Per-step Zod validation; can't advance past invalid step; step indicator; drafts autosaved; back/forward preserves values; final review step; per-step "reward early, punish late".

## Real-estate field rules
- Category-driven dynamic fields (m², oda sayısı, bina yaşı, kat, ısıtma, tapu durumu; imar durumu for arsa).
- Cascading location: il -> ilçe -> mahalle (child disabled until parent chosen; resets on parent change).
- Price/m² use range-aware numeric inputs with tabular numerals and thousands separators.
- Changing policy-relevant fields on an active listing warns that it will re-enter moderation.
