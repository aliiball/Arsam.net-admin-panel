# ADR 0003 — Storybook-First Development
**Status:** Accepted
**Context:** Solo vibe-coding needs enforceable component quality + living docs.
**Decision:** Storybook 10 (`@storybook/react-vite`, ESM-only) with autodocs, `@storybook/addon-a11y`, `@storybook/addon-vitest` for interaction/a11y tests. Every component storied (default/loading/empty/error/mobile); shell adds both layout modes.
**Consequences:** Components built in isolation; a11y + interaction tested in CI; stories double as the DoD gate.
