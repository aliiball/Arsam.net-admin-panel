# ADR 0005 — Forms with React Hook Form + Zod
**Status:** Accepted
**Context:** Complex, dynamic, category-driven real-estate forms need typed validation + great UX.
**Decision:** React Hook Form + Zod via `zodResolver`; Zod schemas are the type source (`z.infer`). Mandatory FieldHelp enforced by FormField; multi-step wizard with per-step validation + drafts.
**Consequences:** One source of truth for shape + validation; consistent help affordance; strong keyboard/a11y support.
